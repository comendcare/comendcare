"use client";

import * as React from "react";
import { Skeleton } from "@comend/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@comend/components/ui/card";
import { Separator } from "@comend/components/ui/separator";
import { useLoadingTimeout } from "~web/hooks/useLoadingTimeout";

function FeedCardSkeleton() {
    return (
        <Card className="rounded-sm w-full">
            <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex flex-col gap-1">
                            {/* org name */}
                            <Skeleton className="h-4 w-36 md:w-48" />
                            {/* timestamp / actor */}
                            <Skeleton className="h-3 w-24 md:w-32" />
                        </div>
                    </div>
                    {/* optional right-side icon/menu */}
                    <Skeleton className="h-4 w-4 rounded" />
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-3">
                {/* action row (icon + title) */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-28 md:w-36" />
                </div>

                {/* description lines */}
                <Skeleton className="h-4 w-[92%]" />
                <Skeleton className="h-4 w-2/3" />
            </CardContent>
        </Card>
    );
}

export default function Loading() {
    // Optional: avoid flash for super-fast loads
    useLoadingTimeout(5000);

    return (
        <main className="flex flex-col justify-start items-center w-full max-w-4xl mx-auto p-8 space-y-4">
            {/* Header block */}
            <div className="w-full space-y-2 flex-col place-self-start">
                <Skeleton className="h-6 w-40 md:w-56" />
                <Skeleton className="h-4 w-64 md:w-80" />
                <Separator />
            </div>

            {/* Feed list skeletons */}
            <div className="flex flex-col gap-3 w-full">
                {Array.from({ length: 3 }).map((_, i) => (
                    <FeedCardSkeleton key={i} />
                ))}

                {/* status row (matches your loading/error area height) */}
                <Skeleton className="h-4 w-28" />

                {/* "Load more" button placeholder */}
                <div className="flex justify-center">
                    <Skeleton className="h-9 w-32 rounded-md" />
                </div>

                {/* end-of-feed text placeholder */}
                <div className="flex justify-center py-4">
                    <Skeleton className="h-3 w-40" />
                </div>
            </div>
        </main>
    );
}
