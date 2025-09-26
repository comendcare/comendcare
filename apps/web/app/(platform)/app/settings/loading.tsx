"use client";

import * as React from "react";
import { Skeleton } from "@comend/components/ui/skeleton";
import { useLoadingTimeout } from "~web/hooks/useLoadingTimeout";

function SettingsRowSkeleton({
                                 danger = false,
                             }: { danger?: boolean }) {
    return (
        <div
            className={[
                "w-full border rounded-md p-8 flex items-center justify-between gap-4",
                danger ? "border-red-200" : "border-gray-200",
            ].join(" ")}
        >
            <div className="flex flex-col flex-grow space-y-2">
                <Skeleton className="h-5 w-56" />       {/* title */}
                <Skeleton className="h-4 w-[34rem] max-w-full" /> {/* description */}
            </div>

            {/* right-side action (button / trigger area) */}
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-32 rounded-md" />
            </div>
        </div>
    );
}

export default function Loading() {
    // avoid flash if load completes instantly
    useLoadingTimeout(5000);

    return (
        <main className="flex flex-col items-start w-full h-full mx-auto p-8 space-y-8">
            {/* Page header */}
            <div className="w-full flex flex-col space-y-4">
                <div>
                    <Skeleton className="h-6 w-48" />         {/* "Permanent Settings" */}
                    <div className="mt-2">
                        <Skeleton className="h-4 w-[40rem] max-w-full" /> {/* subtitle */}
                    </div>
                </div>

                {/* Export organization data row */}
                <SettingsRowSkeleton />

                {/* Delete organization row (danger-styled border) */}
                <SettingsRowSkeleton danger />
            </div>
        </main>
    );
}
