import * as React from "react";
import { Skeleton } from "@comend/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@comend/components/ui/card";

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
            <CardContent className="grid grid-cols-3 gap-4 overflow-hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-full h-64">
                        <div className="h-full bg-white shadow-sm rounded-lg overflow-hidden border">
                            <div className="flex flex-col justify-start items-start gap-4 p-10">
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

function ResearchPlansSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-56" /> {/* "My research plans" */}
        <Skeleton className="h-10 w-56 rounded-md" /> {/* Create button */}
      </div>

      {/* Card Grid */}
      <div className="grid w-full grid-cols-2 xl:grid-cols-3 gap-4">
        <ResearchPlanCardSkeleton />
        <ResearchPlanCardSkeleton />
      </div>
    </div>
  );
}

function ResearchPlanCardSkeleton() {
  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border p-6">
      {/* Top badges row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" /> {/* Published */}
        <Skeleton className="h-6 w-20 rounded-full" /> {/* Status pill */}
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-3/4" />

      {/* Description */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Strategy + Stage row */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-40 rounded-md" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t pt-4">
        {/* Partners */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
        </div>

        {/* Links */}
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
    return (
        <main className="flex flex-col items-center h-full w-full mx-auto p-4 gap-4">
            {/* Research plan templates */}
            <TemplatesSectionSkeleton />

            {/* Existing research plans section */}
            <div className="p-6 w-full">
                <div className="w-full flex justify-between items-center gap-4 mb-4">
                    <Skeleton className="h-7 w-40" /> {/* "Research Plans" */}
                    <Skeleton className="h-9 w-24 rounded-md" /> {/* Share button */}
                </div>

                <ResearchPlansSkeleton />
            </div>
        </main>
    );
}
