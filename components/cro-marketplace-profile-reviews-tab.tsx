import {Company, Organization, Review, User} from "@prisma/client";
import {CROReviewCard} from "@/components/cro-review-card";
import CROReviewDialog from "@/components/cro-review-dialog";
import CRORatingSection from "@/components/cro-rating-section";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";

interface ReviewWithAuthor extends Review {
    author: User;
    organization: Organization;
}

interface CompanyWithReviews extends Company {
    reviews: ReviewWithAuthor[];
}

export default function CROMarketplaceProfileReviewsTab({cro}: { cro: CompanyWithReviews }) {
    return (
        <div className="pt-4 pb-8">
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1">
                    <CRORatingSection reviews={cro.reviews}/>
                </div>
                <div className="col-span-2 flex flex-col space-y-8">
                    <div className="place-self-end">
                        <CROReviewDialog cro={cro}/>
                    </div>
                    {cro.reviews.length === 0 ?
                        <Card className="w-full flex flex-col mx-auto justify-center items-center align-center">
                            <CardContent className="flex gap-4 p-4">
                                <div>
                                    <Image
                                        alt="No recommendations"
                                        src="https://illustrations.popsy.co/white/question-mark.svg"
                                        width={200}
                                        height={200}
                                        className="dark:hidden"
                                    />
                                    <Image
                                        alt="No recommendations"
                                        src="https://illustrations.popsy.co/white/question-mark.svg"
                                        width={200}
                                        height={200}
                                        className="hidden dark:block"
                                    />
                                </div>
                                <div className="flex flex-col justify-center gap-4 items-start">
                                    <h2 className="text-xl">{`No one's left a review for this CRO yet.`}</h2>
                                    <p className="text-md">
                                        {`You can be the first!`}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        : cro.reviews.map((review, index) => (
                        <CROReviewCard key={index} review={review} cro={cro}/>
                    ))}
                </div>
            </div>
        </div>
    )
}
