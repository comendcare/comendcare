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
    researchPlanId: string;
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
    organization?: { id?: string; name?: string; image?: string }; // <- image for org avatar
}

interface Props {
    data: {
        id: string;
        title: string;
        content: Content;
        orgId?: string;
        orgSubdomain?: string;
        createdAt: string | Date;
    };
}

export default function ProjectUpdatedCard({ data }: Props) {
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);

    const actorName = data.content.actor?.name ?? "Someone";
    const orgName = data.content.organization?.name ?? "Organization";
    const orgId = data.content.organization?.id ?? data.orgId;
    const orgSubdomain = data.orgSubdomain;
    const orgImage = data.content.organization?.image;

    const items = data.content.projects ?? [];
    const preview = items.slice(0, 3);
    const extra = Math.max(items.length - preview.length, 0);

    const actionTitle = items.length === 1 ? "Project Updated" : "Projects Updated";

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                {/* Header: Organization as subject (image + name) */}
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ProfilePhoto img={orgImage} name={orgName} className="h-8 w-8 rounded-full" />
                            <div className="flex flex-col">
                                {orgSubdomain ? (
                                    <Link
                                        href={`/app/organization/${orgSubdomain}`}
                                        className="font-medium md:text-base underline-offset-2 hover:underline"
                                    >
                                        {orgName}
                                    </Link>
                                ) : (
                                    <span className="font-medium md:text-base">{orgName}</span>
                                )}
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

                {/* Body: Action title + feed-style description + preview list */}
                <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <Workflow className="h-4 w-4" />
                        <span>{actionTitle}</span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {actorName} updated {items.length === 1 ? "a project" : `${items.length} projects`} for{" "}
                        <span className="font-medium">{orgName}</span>. Review the latest changes and details
                        below.
                    </p>

                    <ul className="mt-1 space-y-1 text-sm">
                        {preview.map((p) => (
                            <li key={p.projectId} className="flex items-center justify-between">
                                <span className="truncate">{p.title ?? p.projectId}</span>
                                <Link
                                    href={p.projectId ? `/project/${p.projectId}` : "#"}
                                    aria-disabled={!p.projectId}
                                    className="text-xs underline-offset-2 hover:underline"
                                >
                                    View
                                </Link>
                            </li>
                        ))}
                        {extra > 0 && <li className="text-xs text-muted-foreground">+{extra} more…</li>}
                    </ul>
                </CardContent>

                {(items.length === 1 && items[0]?.projectId && items[0]?.researchPlanId) || orgSubdomain ? (
                    <CardFooter className="flex justify-end p-4 pt-0">
                        {items.length === 1 && items[0]?.projectId && items[0]?.researchPlanId ? (
                            <Link
                                href={`/app/research-plan/${items[0].researchPlanId}?project=${items[0].projectId}`}
                                passHref
                            >
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex gap-1 items-center"
                                    title="View Project"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    View Project
                                </Button>
                            </Link>
                        ) : (
                            orgSubdomain && (
                                <Link href={`/org/${orgSubdomain}`} passHref>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex gap-1 items-center"
                                        title="View All Projects"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        View All
                                    </Button>
                                </Link>
                            )
                        )}
                    </CardFooter>
                ) : null}
            </Card>
        </MotionConfig>
    );
}
