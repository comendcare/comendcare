"use client"

import { Skeleton } from "@comend/components/ui/skeleton"

export default function Loading() {
    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl p-4 h-full items-center mx-auto">
            {/* Page header */}
            <div className="flex gap-2 w-full justify-between items-center">
                <Skeleton className="h-8 w-80 rounded-md" /> {/* title */}
                <Skeleton className="h-9 w-32 rounded-md" /> {/* new button */}
            </div>

            {/* List skeleton (when RFPs exist) */}
            <div className="w-full gap-4 flex flex-col">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-full border rounded-md p-4 space-y-4">
                        {/* Card header */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded" /> {/* icon */}
                            <Skeleton className="h-8 w-80 rounded-md" /> {/* title */}
                            <Skeleton className="h-8 w-16 rounded-md" /> {/* badge */}
                        </div>
                        <Skeleton className="h-4 w-3/4 rounded-md" /> {/* description */}

                        {/* Card content: property badges */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            <Skeleton className="h-6 w-28 rounded-md" />
                            <Skeleton className="h-6 w-36 rounded-md" />
                            <Skeleton className="h-6 w-32 rounded-md" />
                            <Skeleton className="h-6 w-40 rounded-md" />
                        </div>

                        {/* Footer badges */}
                        <div className="flex gap-4 mt-2">
                            <Skeleton className="h-6 w-full rounded-md" />
                            <Skeleton className="h-6 w-full rounded-md" />
                            <Skeleton className="h-6 w-full rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}
