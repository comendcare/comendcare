import React from "react";
import { Review } from "@prisma/client";

export const Star = ({ filled }: { filled: boolean }) => (
    <svg
        className={`w-4 h-4 ${filled ? "text-yellow-300" : "text-gray-300 dark:text-gray-500"} me-1`}
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 22 20"
    >
        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
    </svg>
);

const RatingBar = ({ label, percentage }: { label: number; percentage: number }) => (
    <div className="flex items-center mt-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">{label} star</span>
        <div className="w-2/4 h-5 mx-4 bg-gray-200 rounded-sm dark:bg-gray-700">
            <div className="h-5 bg-yellow-300 rounded-sm" style={{ width: percentage > 0 ? `${percentage}%` : "1px" }}></div>
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</span>
    </div>
);

const CRORatingSection = ({ reviews }: { reviews: Review[] }) => {
    const validReviews = reviews.filter((review) => review.rating >= 1 && review.rating <= 5);
    const totalReviews = validReviews.length;

    let avgRating = 0;
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalReviews > 0) {
        const totalRating = validReviews.reduce((acc, review) => acc + review.rating, 0);
        avgRating = totalRating / totalReviews;

        validReviews.forEach((review) => {
            const roundedRating = Math.round(review.rating);
            ratingCounts[roundedRating] += 1;
        });
    }

    const ratingPercentages = Object.entries(ratingCounts)
        .map(([rating, count]) => ({
            label: Number(rating),
            percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
        }))
        .reverse();

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer reviews</h3>

            {/* Star Rating Display */}
            <div className="flex items-center mb-2">
                {[...Array(5)].map((_, index) => (
                    <Star key={index} filled={index < Math.round(avgRating)} />
                ))}
                <p className="ms-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {totalReviews > 0 ? (
                        <>
                            {Number.isInteger(avgRating) ? avgRating : avgRating.toFixed(2)} out of 5
                        </>
                    ) : (
                        "No reviews yet"
                    )}
                </p>
            </div>

            {/* Total Review Count */}
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {totalReviews > 0 ? `${totalReviews} global ratings` : "No ratings yet"}
            </p>

            {/* Rating Distribution Bars */}
            {ratingPercentages.map(({ label, percentage }) => (
                <RatingBar key={label} label={label} percentage={percentage} />
            ))}

            {/* Placeholder for "How are ratings calculated?" */}
            {/*<p className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">*/}
            {/*    How are ratings calculated? ▼*/}
            {/*</p>*/}
        </div>
    );
};

export default CRORatingSection;
