"use client"

import { Skeleton } from "@comend/components/ui/skeleton";
import { useLoadingTimeout } from "~web/hooks/useLoadingTimeout";

export default function Loading() {
    useLoadingTimeout(5000);

    return (
        <div className="grid grid-cols-5 px-4 w-full max-w-7xl my-4 mx-auto gap-4">
            <main className="col-span-5 flex flex-col items-center">
                <div
                    id="profile-scroll-area"
                    className="w-full flex flex-col mx-4 space-y-2"
                >
                    <div className="w-full h-fit flex flex-col space-y-4">
                        {/* Banner */}
                        <div className="pb-4 flex flex-col gap-4 overflow-hidden rounded-md border">
                            <Skeleton className="w-full h-48" />

                            <div className="w-full flex flex-col md:flex-row mx-auto px-8 gap-4 items-start justify-between">
                                <div className="w-full flex flex-row gap-4 items-start">
                                    {/* Profile Photo */}
                                    <div className="h-fit w-fit -mt-16">
                                        <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-white" />
                                    </div>

                                    {/* Org name + meta */}
                                    <div className="flex flex-col space-y-2">
                                        <Skeleton className="h-8 w-48" />
                                        <div className="flex gap-x-6">
                                            <Skeleton className="h-5 w-24" />
                                            <Skeleton className="h-5 w-28" />
                                            <Skeleton className="h-5 w-16" />
                                        </div>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex flex-row space-x-2">
                                    <Skeleton className="h-9 w-32 rounded-md" />
                                    <Skeleton className="h-9 w-40 rounded-md" />
                                </div>
                            </div>
                        </div>

                        {/* Two-column layout */}
                        <div className="grid grid-cols-6 gap-4 pb-8">
                            {/* Left side: conditions + about */}
                            <div className="relative col-span-2 space-y-4">
                                <div className="sticky top-4 space-y-4">
                                    <Skeleton className="h-80 w-full rounded-md" />
                                    <Skeleton className="h-96 w-full rounded-md" />
                                </div>
                            </div>

                            {/* Right side: rfps, tools, roadmaps */}
                            <div className="col-span-4 space-y-4">
                                <Skeleton className="h-40 w-full rounded-md" />
                                <Skeleton className="h-56 w-full rounded-md" />
                                <Skeleton className="h-64 w-full rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

    );
}
