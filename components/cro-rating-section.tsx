import React from "react";

export const CRORatingSection = () => {
    const reviewData = [
        { label: "Staff", score: 8.8, width: "88%" },
        { label: "Communication", score: 8.8, width: "70%" },
        { label: "Timeliness", score: 8.9, width: "89%" },
        { label: "Facilities", score: 5.4, width: "64%" },
    ];

    return (
        <div>
            <div className="flex items-center mb-5">
                <p className="bg-blue-100 text-blue-800 text-sm font-semibold inline-flex items-center p-1.5 rounded-sm dark:bg-blue-200 dark:text-blue-800">8.7</p>
                <p className="ms-2 font-medium text-gray-900 dark:text-white">Excellent</p>
            </div>
            <div className="gap-4">
                {reviewData.map((review, index) => (
                    <div key={index}>
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{review.label}</dt>
                            <dd className="flex items-center mb-3">
                                <div className="w-full bg-gray-200 rounded-sm h-2.5 dark:bg-gray-700 me-2">
                                    <div className="bg-blue-600 h-2.5 rounded-sm dark:bg-blue-500" style={{ width: review.width }}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{review.score}</span>
                            </dd>
                        </dl>
                    </div>
                ))}
            </div>
        </div>
    );
};

