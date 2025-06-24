import React, { useState } from "react";
import { useController } from "react-hook-form";

interface RatingsProps {
    control: any;
    name: string;
    totalStars?: number;
    size?: number;
}

export const StarRatingSelector = ({
                                       control,
                                       name,
                                       totalStars = 5,
                                       size = 16,
                                   }: RatingsProps) => {
    const {
        field: { value = 0, onChange },
    } = useController({ name, control });

    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const displayRating = hoverRating ?? value;
    const fullStars = Math.max(0, Math.floor(displayRating));
    const hasHalfStar = displayRating % 1 !== 0;
    const emptyStars = Math.max(0, totalStars - Math.ceil(displayRating));

    const handleMouseEnter = (index: number) => setHoverRating(index);
    const handleMouseLeave = () => setHoverRating(null);
    const handleClick = (index: number) => onChange(index);

    return (
        <div className="flex items-center" onMouseLeave={handleMouseLeave}>
            {[...Array(fullStars)].map((_, i) => (
                <svg
                    key={i}
                    className="text-yellow-300 me-1 cursor-pointer"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                    width={size}
                    height={size}
                    onClick={() => handleClick(i + 1)}
                    onMouseEnter={() => handleMouseEnter(i + 1)}
                >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                </svg>
            ))}
            {hasHalfStar && (
                <div
                    className="relative me-1 cursor-pointer"
                    onClick={() => handleClick(fullStars + 1)}
                    onMouseEnter={() => handleMouseEnter(fullStars + 1)}
                    style={{ width: size, height: size }}
                >
                    <svg className="absolute top-0 left-0 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20" width={size} height={size}>
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg className="absolute top-0 left-0 text-yellow-300" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20" width={size} height={size} style={{ clipPath: "inset(0 50% 0 0)" }}>
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                </div>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <svg
                    key={i + fullStars + 1}
                    className="text-gray-300 me-1 cursor-pointer"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                    width={size}
                    height={size}
                    onClick={() => handleClick(i + fullStars + 1)}
                    onMouseEnter={() => handleMouseEnter(i + fullStars + 1)}
                >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                </svg>
            ))}
        </div>
    );
};
