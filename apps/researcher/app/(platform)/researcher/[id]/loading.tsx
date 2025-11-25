"use client"

import { Skeleton } from "@comend/components/ui/skeleton";

export default function ResearcherProfileLoading() {
    return (
        <div className="max-w-7xl mx-auto flex flex-col py-4 px-4">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="py-8">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <Skeleton className="w-32 h-32 rounded-full" />

                        {/* Name + Meta */}
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 w-full">
                                <div className="space-y-3">
                                    <Skeleton className="h-8 w-64" /> {/* Name */}
                                    <Skeleton className="h-6 w-40" /> {/* Title */}

                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                        <Skeleton className="h-5 w-40" />
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-5 w-48" />
                                    </div>
                                </div>

                                {/* Edit button */}
                                <Skeleton className="h-9 w-40 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar */}
                    <div className="space-y-6">
                        {/* Metrics card */}
                        <div className="border rounded-md p-4">
                            <Skeleton className="h-6 w-40 mb-4" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>

                        {/* Research interests */}
                        <div className="border rounded-md p-4 space-y-3">
                            <Skeleton className="h-6 w-48" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-28" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="lg:col-span-2">
                        <div className="border rounded-md p-6 space-y-6">
                            <Skeleton className="h-6 w-32" /> {/* About title */}

                            <Skeleton className="h-20 w-full" /> {/* About text block */}

                            {/* Publications section */}
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
