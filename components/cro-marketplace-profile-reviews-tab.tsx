import {Company, Review, User} from "@prisma/client";
import {CROReviewCard} from "@/components/cro-review-card";
import CROReviewForm from "@/components/cro-review-form";

interface ReviewWithAuthor extends Review {
    author: User;
}

interface CompanyWithReviews extends Company {
    reviews: ReviewWithAuthor[];
}

export default function CROMarketplaceProfileReviewsTab({cro}: {cro: CompanyWithReviews}) {
    return (
        <div>
            <CROReviewForm cro={cro}/>
            {cro.reviews.map((review, index) => (
                <CROReviewCard key={index} review={review}/>
            ))}
        </div>
    )
}
