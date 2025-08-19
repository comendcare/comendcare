"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { FileText } from "lucide-react";

interface ResearchPlanCreatedContent {
    roadmapId: string;
    title?: string;
    published?: boolean;
    actor?: {
        userId?: string;
        name?: string;
        // img?: string; // add when you store avatars
    };
    organization?: {
        id?: string;
        name?: string;
        // logo?: string; // add when you store logos
    };
}

interface ResearchPlanCreatedProps {
    data: {
        id: string;
        title: string;
        content: ResearchPlanCreatedContent;
        orgId?: string;
        createdAt: string | Date;
    };
}

export default function ResearchPlanCreatedCard({ data }: ResearchPlanCreatedProps) {
    const createdAt = React.useMemo(
        () => formatDates(data.createdAt as Date),
        [data.createdAt]
    );

    const actorName = data.content.actor?.name ?? "Someone";
    const orgName = data.content.organization?.name;
    const orgId = data.content.organization?.id ?? data.orgId;

    const displayTitle = data.content.title || data.title;
    const isPublished = data.content.published === true;

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <ProfilePhoto
                                img={undefined}
                                name={actorName}
                                className="h-8 w-8 rounded-full"
                            />
                            <div className="flex flex-col">
                <span className="font-medium md:text-base">
                  New Research Plan Created
                </span>
                                <span className="font-light text-muted-foreground text-[0.6rem] md:text-xs leading-3">
                  {createdAt}
                                    {actorName ? (
                                        <span className="ml-1">
                      • by <span className="font-normal">{actorName}</span>
                    </span>
                                    ) : null}
                                    {orgName ? (
                                        <>
                                            {" "}
                                            •{" "}
                                            {orgId ? (
                                                <Link
                                                    href={`/org/${orgId}`}
                                                    className="underline-offset-2 hover:underline"
                                                >
                                                    {orgName}
                                                </Link>
                                            ) : (
                                                <span className="font-normal">{orgName}</span>
                                            )}
                                        </>
                                    ) : null}
                                    {isPublished ? (
                                        <span className="ml-1 inline-flex items-center rounded px-1 py-0.5 text-[0.6rem] md:text-[0.65rem] bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Published
                    </span>
                                    ) : (
                                        <span className="ml-1 inline-flex items-center rounded px-1 py-0.5 text-[0.6rem] md:text-[0.65rem] bg-amber-50 text-amber-700 border border-amber-200">
                      Draft
                    </span>
                                    )}
                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm md:text-base font-semibold">
                            {displayTitle}
                        </h3>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <Link href={`/app/roadmap/${data.content.roadmapId}`} passHref>
                        <Button size="sm" variant="outline" className="flex gap-1 items-center">
                            <FileText className="h-4 w-4" />
                            View Plan
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
