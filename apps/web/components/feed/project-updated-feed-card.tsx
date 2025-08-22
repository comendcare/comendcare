"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { Workflow, ExternalLink } from "lucide-react";

interface ProjectItem {
    projectId: string;
    title?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    private?: boolean;
    status?: string | null;
    budget?: number | null;
    openTo?: string[];
    otherTypeDetails?: string | null;
    timelineOrder?: number | null;
    updatedAt?: string;
}

interface Content {
    projects: ProjectItem[];
    actor?: { userId?: string; name?: string };
    organization?: { id?: string; name?: string };
}

interface Props {
    data: {
        id: string;
        title: string;
        content: Content;
        orgId?: string;
        createdAt: string | Date;
    };
}

export default function ProjectUpdatedCard({ data }: Props) {
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);

    const actorName = data.content.actor?.name ?? "Someone";
    const orgName = data.content.organization?.name;
    const orgId = data.content.organization?.id ?? data.orgId;

    const items = data.content.projects ?? [];
    const preview = items.slice(0, 3);
    const extra = Math.max(items.length - preview.length, 0);

    const displayTitle = data.title || (items.length === 1
        ? `Project updated: ${items[0].title ?? items[0].projectId}`
        : `${items.length} projects updated`);

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <ProfilePhoto img={undefined} name={actorName} className="h-8 w-8 rounded-full" />
                            <div className="flex flex-col">
                                <span className="font-medium md:text-base">Projects Updated</span>
                                <span className="font-light text-muted-foreground text-[0.6rem] md:text-xs leading-3">
                  {createdAt}
                                    {actorName && (
                                        <span className="ml-1">
                      • by <span className="font-normal">{actorName}</span>
                    </span>
                                    )}
                                    {orgName && (
                                        <>
                                            {" "}
                                            •{" "}
                                            {orgId ? (
                                                <Link href={`/org/${orgId}`} className="underline-offset-2 hover:underline">
                                                    {orgName}
                                                </Link>
                                            ) : (
                                                <span className="font-normal">{orgName}</span>
                                            )}
                                        </>
                                    )}
                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <Workflow className="h-4 w-4" />
                        <span>{displayTitle}</span>
                    </div>

                    <ul className="mt-1 space-y-1 text-sm">
                        {preview.map((p) => (
                            <li key={p.projectId} className="flex items-center justify-between">
                                <span className="truncate">{p.title ?? p.projectId}</span>
                                <Link href={`/project/${p.projectId}`} className="text-xs underline-offset-2 hover:underline">
                                    View
                                </Link>
                            </li>
                        ))}
                        {extra > 0 && (
                            <li className="text-xs text-muted-foreground">+{extra} more…</li>
                        )}
                    </ul>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    {items.length === 1 ? (
                        <Link href={`/project/${items[0].projectId}`} passHref>
                            <Button size="sm" variant="outline" className="flex gap-1 items-center">
                                <ExternalLink className="h-4 w-4" />
                                View Project
                            </Button>
                        </Link>
                    ) : (
                        <Link href={orgId ? `/org/${orgId}` : "#"} aria-disabled={!orgId} passHref>
                            <Button size="sm" variant="outline" className="flex gap-1 items-center" disabled={!orgId}>
                                <ExternalLink className="h-4 w-4" />
                                View All
                            </Button>
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
