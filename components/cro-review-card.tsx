import React from "react";
import {Review} from "@prisma/client";

export const CROReviewCard = ({review}: {review: Review}) => {
    return (
        <article className="md:gap-8 md:grid md:grid-cols-3">
            <div>
                <div className="flex items-center mb-6">
                    <img
                        className="w-10 h-10 rounded-full"
                        src="/docs/images/people/profile-picture-5.jpg"
                        alt="Jese Leos"
                    />
                    <div className="ms-4 font-medium dark:text-white">
                        <p>Jese Leos</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg
                                aria-hidden="true"
                                className="w-5 me-1.5"
                                viewBox="0 0 18 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect x="0.053" width="17" height="12.143" rx="2" fill="white" />
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M17.053 0H0.053V12.143H17.053V0Z"
                                    fill="#D02F44"
                                />
                            </svg>
                            United States
                        </div>
                    </div>
                </div>
                <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                    <li className="flex items-center">
                        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
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
                        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Z" />
                        </svg>
                        3 nights December 2021
                    </li>
                    <li className="flex items-center">
                        <svg className="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 19">
                            <path d="M14.5 0A3.987 3.987 0 0 0 11 2.1a4.977 4.977 0 0 1 3.9 5.858A3.989 3.989 0 0 0 14.5 0ZM9 13h2a4 4 0 0 1 4 4v2H5v-2a4 4 0 0 1 4-4Z" />
                        </svg>
                        Family
                    </li>
                </ul>
            </div>
            <div className="col-span-2 mt-6 md:mt-0">
                <div className="flex items-start mb-5">
                    <div className="pe-4">
                        <footer>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                Reviewed: <time dateTime="2022-01-20 19:00">January 20, 2022</time>
                            </p>
                        </footer>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            Spotless, good appliances, excellent layout, host was genuinely nice and helpful.
                        </h4>
                    </div>
                    <p className="bg-blue-700 text-white text-sm font-semibold inline-flex items-center p-1.5 rounded-sm">
                        8.7
                    </p>
                </div>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                    The flat was spotless, very comfortable, and the host was amazing. I highly recommend this accommodation for anyone visiting New York city centre.
                </p>
                <p className="mb-5 text-gray-500 dark:text-gray-400">
                    It is obviously not the same build quality as those very expensive watches. But that is like comparing a Citroën to a Ferrari. This watch was well under £100! An absolute bargain.
                </p>
                <aside className="flex items-center mt-3">
                    <a href="#" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                        Helpful
                    </a>
                    <a href="#" className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-500 group ms-5">
                        Not helpful
                    </a>
                </aside>
            </div>
        </article>
    );
};

