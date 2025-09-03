"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { MessageSquareText, ExternalLink } from "lucide-react";

interface Content {
    requestId: string;
    commentId: string;
    preview: string;
    actor?: { userId?: string; name?: string };
    organization?: { id?: string; name?: string; image?: string; logo?: string };
    title?: string; // optional: request title if available
}

interface Props {
    data: { id: string; title: string; content: Content; orgId?: string; orgSubdomain?: string; createdAt: string | Date };
}

export default function ToolRequestCommentCard({ data }: Props) {
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);
    const actorName = data.content.actor?.name ?? "Someone";

    // SUBJECT: Organization
    const orgName = data.content.organization?.name ?? "Organization";
    const orgSubdomain = data.orgSubdomain;
    const orgId = data.content.organization?.id ?? data.orgId;
    const orgImage = data.content.organization?.image ?? data.content.organization?.logo;

    const actionTitle = "Tool Request Comment"; // action belongs in body

    const displayTitle = data.content.title || data.title || "Tool request";

    const threadHref = data.content.requestId
                ? `/app/requests/${data.content.requestId}`
                : "#";
    const hasThreadLink = Boolean(data.content.requestId);

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                {/* HEADER focuses on the SUBJECT: the Organization */}
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            {/* Organization avatar/logo */}
                            <ProfilePhoto img={orgImage} name={orgName} className="h-8 w-8 rounded-full" />
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

                {/* BODY: feed-style notification */}
                <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <MessageSquareText className="h-4 w-4" />
                        <span>{actionTitle}</span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {actorName} commented on the tool request “
                        <span className="font-medium text-foreground">{displayTitle}</span>” for {orgName}.
                    </p>

                    {/* Comment preview */}
                    {data.content.preview && (
                        <div className="text-xs md:text-sm rounded border bg-muted/40 px-3 py-2 text-muted-foreground whitespace-pre-line">
                            {data.content.preview}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <Link href={threadHref} aria-disabled={!hasThreadLink} passHref>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex gap-1 items-center"
                            disabled={!hasThreadLink}
                            title={hasThreadLink ? "View Thread" : "No request link available"}
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Thread
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
