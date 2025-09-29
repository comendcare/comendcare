"use client"

import {Skeleton} from "@comend/components/ui/skeleton";
import {useLoadingTimeout} from "~web/hooks/useLoadingTimeout";

export default function Loading() {
    useLoadingTimeout(5000)

    return (
        <div className="flex flex-col space-y-8 w-full max-w-5xl mx-auto py-8">
            <Skeleton className="h-[20px] w-full" />
            <Skeleton className="h-[32px] w-full" />
            <Skeleton className="mt-4 h-[80px] w-full" />
            <Skeleton className="h-[80px] w-full" />
            <Skeleton className="mt-4 h-[40px] w-full" />
            <Skeleton className="h-[20px] w-full" />
            <Skeleton className="h-[32px] w-full" />
            <Skeleton className="mt-4 h-[80px] w-full" />
            <Skeleton className="h-[80px] w-full" />
            <Skeleton className="mt-4 h-[40px] w-full" />
        </div>
    );
}
