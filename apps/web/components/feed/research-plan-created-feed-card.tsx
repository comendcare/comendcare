"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { FileText, ClipboardList } from "lucide-react";

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
        image?: string; // prefer image if present
        logo?: string; // fallback support if you later switch to logo
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
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);

    const actorName = data.content.actor?.name ?? "Someone";
    const orgName = data.content.organization?.name ?? "Organization";
    const orgId = data.content.organization?.id ?? data.orgId;
    const orgImage = data.content.organization?.image ?? data.content.organization?.logo;

    // ACTION: moved into CardContent as the title of the notification
    const actionTitle = "Research Plan Created";

    const displayTitle = data.content.title || data.title;
    const isPublished = data.content.published === true;

    const planHref = data.content.roadmapId ? `/app/roadmap/${data.content.roadmapId}` : "#";

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                {/* HEADER focuses on the SUBJECT: the Organization */}
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Organization avatar/logo */}
                            <ProfilePhoto img={orgImage} name={orgName} className="h-8 w-8 rounded-full" />

                            {/* Organization name to the right of the image */}
                            <div className="flex flex-col">
                                {orgId ? (
                                    <Link
                                        href={`/org/${orgId}`}
                                        className="font-medium md:text-base underline-offset-2 hover:underline"
                                    >
                                        {orgName}
                                    </Link>
                                ) : (
                                    <span className="font-medium md:text-base">{orgName}</span>
                                )}

                                {/* meta: timestamp • by actor */}
                                <span className="font-light text-muted-foreground text-[0.6rem] md:text-xs leading-3">
                  {createdAt}
                                    {actorName && (
                                        <span className="ml-1">
                      • by <span className="font-normal">{actorName}</span>
                    </span>
                                    )}
                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                {/* BODY becomes the feed-style notification content */}
                <CardContent className="p-4 pt-0">
                    {/* Action title inside content */}
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <ClipboardList className="h-4 w-4" />
                        <span>{actionTitle}</span>
                    </div>

                    {/* Description as a realistic notification */}
                    <p className="mt-2 text-sm text-muted-foreground">
                        {actorName} created a research plan
                        {displayTitle ? (
                            <>
                                {" "}
                                “<span className="font-medium text-foreground">{displayTitle}</span>”
                            </>
                        ) : null}{" "}
                        for {orgName}. {isPublished ? "It has been published." : "It is currently a draft."} You
                        can review the plan, assign owners, and track progress.
                    </p>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <Link href={planHref} aria-disabled={!data.content.roadmapId} passHref>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex gap-1 items-center"
                            disabled={!data.content.roadmapId}
                            title={data.content.roadmapId ? "View Plan" : "No plan link available"}
                        >
                            <FileText className="h-4 w-4" />
                            View Plan
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
