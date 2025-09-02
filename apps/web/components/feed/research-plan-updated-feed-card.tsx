"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { ClipboardList, FileText, BadgeCheck, Pencil } from "lucide-react";

interface ResearchPlanUpdatedContent {
    roadmapId: string;
    title?: string;
    published?: boolean;
    changedFields?: string[];
    changes?: Record<string, { before: unknown; after: unknown }>;
    actor?: {
        userId?: string;
        name?: string;
    };
    organization?: {
        id?: string;
        name?: string;
        image?: string; // prefer image if stored
        logo?: string; // optional fallback
    };
}

interface ResearchPlanUpdatedProps {
    data: {
        id: string;
        title: string; // event title (e.g., "Research plan updated: XYZ")
        content: ResearchPlanUpdatedContent;
        orgId?: string;
        orgSubdomain?: string;
        createdAt: string | Date;
    };
}

export default function ResearchPlanUpdatedCard({ data }: ResearchPlanUpdatedProps) {
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);

    const actorName = data.content.actor?.name ?? "Someone";
    const orgName = data.content.organization?.name ?? "Organization";
    const orgSubdomain = data.orgSubdomain;
    const orgId = data.content.organization?.id ?? data.orgId;
    const orgImage = data.content.organization?.image ?? data.content.organization?.logo;

    const displayTitle =
        data.content.title || data.title?.replace(/^Research plan updated:\s*/i, "") || "Research plan";

    const { changedFields = [], changes, published } = data.content;

    // prepare a compact view of up to 3 diffs
    const diffEntries = React.useMemo(() => {
        if (!changes) return [] as Array<{ key: string; before: string; after: string }>;
        const keys = Object.keys(changes);
        return keys.slice(0, 3).map((k) => ({
            key: k,
            before: typeof changes[k].before === "object" ? JSON.stringify(changes[k].before) : String(changes[k].before ?? ""),
            after: typeof changes[k].after === "object" ? JSON.stringify(changes[k].after) : String(changes[k].after ?? ""),
        }));
    }, [changes]);

    const planHref = data.content.roadmapId ? `/app/research-plan/${data.content.roadmapId}` : "#";

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                {/* HEADER now focuses on the SUBJECT: the Organization */}
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Organization image/logo */}
                            <ProfilePhoto img={orgImage} name={orgName} className="h-8 w-8 rounded-full" />

                            {/* Organization name to the right of the image */}
                            <div className="flex flex-col">
                                {orgSubdomain ? (
                                    <Link href={`/app/organization/${orgSubdomain}`} className="font-medium md:text-base underline-offset-2 hover:underline">
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

                {/* BODY becomes the feed-style notification content */}
                <CardContent className="p-4 pt-0">
                    {/* Action title inside content */}
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <ClipboardList className="h-4 w-4" />
                        <span>Research Plan Updated</span>
                    </div>

                    {/* Description written like a realistic notification */}
                    <p className="mt-2 text-sm text-muted-foreground">
                        {actorName} updated the research plan
                        {displayTitle ? (
                            <>
                                {" "}
                                “<span className="font-medium text-foreground">{displayTitle}</span>”
                            </>
                        ) : null}{" "}
                        for {orgName}.{" "}
                        {typeof published === "boolean" && (
                            <>
                                {published ? " It is now published." : " It remains unpublished."}
                            </>
                        )}
                    </p>

                    {/* Chips summarizing changed fields */}
                    {changedFields.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {changedFields.map((field) => (
                                <span key={field} className="inline-flex items-center gap-1 text-[0.65rem] md:text-xs rounded px-2 py-0.5 bg-muted text-muted-foreground">
                  <Pencil className="h-3 w-3" />
                                    {field}
                </span>
                            ))}
                        </div>
                    )}

                    {/* Compact diffs (first 3) */}
                    {diffEntries.length > 0 && (
                        <div className="mt-2 grid gap-1.5">
                            {diffEntries.map(({ key, before, after }) => (
                                <div key={key} className="text-xs">
                                    <div className="font-medium">{key}</div>
                                    <div className="rounded bg-muted/40 p-2">
                                        <div className="opacity-70">
                                            <span className="font-medium">Before:</span>{" "}
                                            <span className="break-words">{before || "—"}</span>
                                        </div>
                                        <div className="opacity-70">
                                            <span className="font-medium">After:</span>{" "}
                                            <span className="break-words">{after || "—"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {changes && Object.keys(changes).length > diffEntries.length && (
                                <div className="text-[0.7rem] text-muted-foreground">and {Object.keys(changes).length - diffEntries.length} more…</div>
                            )}
                        </div>
                    )}

                    {/* Published/Unpublished badge (inline alternative) */}
                    {typeof published === "boolean" && (
                        <div className="mt-2">
              <span
                  className="inline-flex items-center gap-1 text-[0.65rem] md:text-xs rounded px-1.5 py-0.5 bg-muted text-muted-foreground"
                  title={published ? "Published" : "Unpublished"}
              >
                <BadgeCheck className="h-3 w-3" />
                  {published ? "Published" : "Unpublished"}
              </span>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <Link href={planHref} aria-disabled={!data.content.roadmapId} passHref>
                        <Button size="sm" variant="outline" className="flex gap-1 items-center" disabled={!data.content.roadmapId} title={data.content.roadmapId ? "View Plan" : "No plan link available"}>
                            <FileText className="h-4 w-4" />
                            View Plan
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
