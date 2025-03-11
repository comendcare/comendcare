"use client"
import React from "react";
import {Review, User, Organization} from "@prisma/client";
import {StarRatingIndicator} from "@/components/star-rating-indicator";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useSession} from "next-auth/react";
import {FaEllipsisVertical, FaFlag, FaPencil, FaTrash} from "react-icons/fa6";


interface ReviewWithAuthor extends Review {
    author: User;
    organization: Organization;
}

export const CROReviewCard = ({review}: { review: ReviewWithAuthor }) => {
    const {data: session} = useSession()

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Avatar className="h-10 w-10 rounded-full">
                            <AvatarImage
                                src={review.author.image || ""}
                                alt={review.author.name || "Author name"}
                            />
                            <AvatarFallback className="rounded-lg">
                                {review.author.name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="ms-4 font-medium dark:text-white">
                            <p>
                                {review.author.name}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                {review.organization?.name}
                            </div>
                        </div>
                    </div>

                    <div className="font-medium dark:text-white">
                        <StarRatingIndicator rating={review.rating}/>
                        <div className="flex items-start">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Reviewed:{" "}
                                <time dateTime={new Date(review.createdAt).toISOString()}>
                                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </time>
                            </p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <FaEllipsisVertical/>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {session?.user.id === review.author.id &&
                                <DropdownMenuItem>
                                    <FaPencil/>
                                    Edit review
                                </DropdownMenuItem>
                            }
                            {session?.user.id !== review.author.id &&
                                <DropdownMenuItem>
                                    <FaFlag/>
                                    Report review
                                </DropdownMenuItem>
                            }
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem>
                                <FaTrash/>
                                Delete review
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <ul className="flex flex-row space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <li className="flex items-center">
                        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 20 20">
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 15V9m4 6V9m4 6V9m4 6V9M2 16h16M1 19h18M2 7v1h16V7l-8-6-8 6Z"
                            />
                        </svg>
                        Apartment with city view
                    </li>
                    <li className="flex items-center">
                        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                             fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Z"/>
                        </svg>
                        3 nights December 2021
                    </li>
                    <li className="flex items-center">
                        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                             fill="currentColor" viewBox="0 0 20 19">
                            <path
                                d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z"/>
                        </svg>
                        Family
                    </li>
                </ul>
            </div>

            <div className="col-span-2 mt-6 md:mt-0">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {review.title}
                </h4>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                    {review.body}
                </p>
                <aside className="flex items-center mt-3">
                    <a href="#"
                       className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                        Helpful
                    </a>
                    <a href="#"
                       className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-500 group ms-5">
                        Not helpful
                    </a>
                </aside>
            </div>
        </div>
    );
};

