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
import { Trophy, Eye, ExternalLink, Globe } from "lucide-react";

interface OrgProfileViewsMilestoneContent {
    milestone: number;          // e.g., 10, 100, 1000, ...
    totalViews: number;         // lifetime so far
    host?: string;              // e.g., "acme.comend.io"
    organization?: {
        id?: string;
        name?: string;
    };
    // (no actor for analytics, but keep shape flexible)
    actor?: {
        userId?: string;
        name?: string;
    };
}

interface OrgProfileViewsMilestoneProps {
    data: {
        id: string;
        title: string;
        content: OrgProfileViewsMilestoneContent;
        orgId?: string;
        createdAt: string | Date;
    };
}

export default function AnalyticsGoalReachedCard({
                                                         data,
                                                     }: OrgProfileViewsMilestoneProps) {
    const createdAt = React.useMemo(
        () => formatDates(data.createdAt as Date),
        [data.createdAt]
    );

    const orgName =
        data.content.organization?.name ?? undefined;
    const orgId =
        data.content.organization?.id ?? data.orgId ?? undefined;

    const milestone = Number(data.content.milestone || 0);
    const totalViews = Number(data.content.totalViews || 0);
    const host = data.content.host?.trim();

    const niceMilestone = React.useMemo(
        () => (Number.isFinite(milestone) ? milestone.toLocaleString() : "—"),
        [milestone]
    );
    const niceTotal = React.useMemo(
        () => (Number.isFinite(totalViews) ? totalViews.toLocaleString() : "—"),
        [totalViews]
    );

    const displayTitle =
        data.title || `🎉 ${niceMilestone} public profile views!`;

    const actorName = data.content.actor?.name ?? "Analytics";

    return (
        <MotionConfig transition={{duration: 0.3}}>
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
                  Profile Views Milestone
                </span>
                                <span className="font-light text-muted-foreground text-[0.6rem] md:text-xs leading-3">
                  {createdAt}
                                    {orgName && (
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
                                    )}
                                    {host && (
                                        <>
                                            {" "}
                                            •{" "}
                                            <a
                                                href={`https://${host}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                                                title={`Open ${host}`}
                                            >
                                                <Globe className="h-3 w-3"/>
                                                <span>{host}</span>
                                            </a>
                                        </>
                                    )}
                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                            <Trophy className="h-4 md:h-5 w-4 md:w-5"/>
                            <span>{displayTitle}</span>
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="inline-flex items-center gap-1.5 text-sm md:text-base">
                                <Eye className="h-4 w-4"/>
                                <span>
                  Total views:{" "}
                                    <span className="font-medium text-foreground">
                    {niceTotal}
                  </span>
                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0 gap-2">
                    {host && (
                        <a
                            href={`https://${host}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open public profile"
                        >
                            <Button size="sm" variant="ghost" className="flex gap-1 items-center">
                                <ExternalLink className="h-4 w-4"/>
                                Open Site
                            </Button>
                        </a>
                    )}
                    <Link
                        href={orgId ? `/org/${orgId}` : "#"}
                        aria-disabled={!orgId}
                        passHref
                    >
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex gap-1 items-center"
                            disabled={!orgId}
                            title={orgId ? "View Profile" : "No profile link available"}
                        >
                            <Eye className="h-4 w-4"/>
                            View Profile
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    )
}
