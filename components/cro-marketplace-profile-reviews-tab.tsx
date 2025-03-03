import {Company, Review} from "@prisma/client";
import {CROReviewCard} from "@/components/cro-review-card";
import CROReviewForm from "@/components/cro-review-form";

interface CompanyWithReviews extends Company {
    reviews: Review[];
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
