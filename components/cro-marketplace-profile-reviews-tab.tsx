import {Company, Organization, Review, User} from "@prisma/client";
import {CROReviewCard} from "@/components/cro-review-card";
import CROReviewDialog from "@/components/cro-review-dialog";
import {CRORatingSection} from "@/components/cro-rating-section";

interface ReviewWithAuthor extends Review {
    author: User;
    organization: Organization;
}

interface CompanyWithReviews extends Company {
    reviews: ReviewWithAuthor[];
}

export default function CROMarketplaceProfileReviewsTab({cro}: { cro: CompanyWithReviews }) {
    return (
        <div>
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1">
                    <CRORatingSection/>
                </div>
                <div className="col-span-2 flex flex-col space-y-8">
                    <div className="place-self-end">
                        <CROReviewDialog cro={cro}/>
                    </div>
                    {cro.reviews.map((review, index) => (
                        <CROReviewCard key={index} review={review}/>
                    ))}
                </div>
            </div>
        </div>
    )
}
