"use client";

import * as React from "react";
import { Skeleton } from "@comend/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@comend/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@comend/components/ui/table";
import { useLoadingTimeout } from "~web/hooks/useLoadingTimeout";

function TemplatesSectionSkeleton() {
    return (
        <Card className="w-full bg-gray-50">
            <CardHeader className="relative">
                <CardTitle>
                    <Skeleton className="h-6 w-48" />
                </CardTitle>
                <CardDescription>
                    <Skeleton className="h-4 w-80" />
                </CardDescription>
                {/* close (X) button area */}
                <div className="absolute top-0 right-0 p-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </CardHeader>

            {/* grid of template cards (empty + curated) */}
            <CardContent className="flex gap-4 flex-row overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="size-64">
                        <div className="h-full bg-white shadow-sm rounded-lg overflow-hidden border">
                            <div className="flex flex-col justify-center items-center gap-4 p-10">
                                <Skeleton className="h-5 w-56" />
                                <Skeleton className="h-6 w-6 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function GroupHeaderSkeleton({ labelWidth = "w-28" }: { labelWidth?: string }) {
    return (
        <TableRow className="cursor-pointer bg-gray-50">
            <TableCell colSpan={2} className="p-2">
                <div className="flex justify-between items-center">
                    <Skeleton className={`h-4 ${labelWidth}`} />
                    <Skeleton className="h-4 w-4 rounded" />
                </div>
            </TableCell>
        </TableRow>
    );
}

function RoadmapRowSkeleton() {
    return (
        <TableRow>
            <TableCell>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-64" /> {/* title */}
                    <Skeleton className="h-4 w-96 max-w-full" /> {/* description */}
                </div>
            </TableCell>
            <TableCell className="flex justify-end items-center">
                <Skeleton className="h-6 w-28 rounded-full" /> {/* stage badge */}
            </TableCell>
        </TableRow>
    );
}

function RoadmapsTableSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow className="pointer-events-none">
                    <TableHead className="w-full">
                        <Skeleton className="h-4 w-40" /> {/* Title & Description */}
                    </TableHead>
                    <TableHead className="w-fit text-nowrap">
                        <Skeleton className="h-4 w-36" /> {/* Stage of Activity */}
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {/* A few modality groups */}
                <GroupHeaderSkeleton labelWidth="w-24" />
                <RoadmapRowSkeleton />

                <GroupHeaderSkeleton labelWidth="w-32" />
                <RoadmapRowSkeleton />
                <RoadmapRowSkeleton />

                {/* "Other" group */}
                <GroupHeaderSkeleton labelWidth="w-16" />
                <RoadmapRowSkeleton />
            </TableBody>
        </Table>
    );
}

export default function Loading() {
    // Optional: avoids flashing skeletons on ultra-fast loads
    useLoadingTimeout(5000);

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto p-4 gap-4">
            {/* Research Plan Templates */}
            <TemplatesSectionSkeleton />

            {/* Existing research plans section */}
            <div className="p-6 w-full">
                <div className="w-full flex justify-between items-center gap-4 mb-4">
                    <Skeleton className="h-7 w-40" /> {/* "Research Plans" */}
                    <Skeleton className="h-9 w-24 rounded-md" /> {/* Share button */}
                </div>

                <RoadmapsTableSkeleton />
            </div>
        </main>
    );
}
