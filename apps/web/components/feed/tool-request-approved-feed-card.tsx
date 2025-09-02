"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { CheckCircle2, ExternalLink } from "lucide-react";

interface Content {
    requestId: string;
    title?: string;
    approvedAt?: string;
    actor?: { userId?: string; name?: string };
    organization?: { id?: string; name?: string; image?: string; logo?: string };
}

interface Props {
    data: { id: string; title: string; content: Content; orgId?: string; orgSubdomain?: string; createdAt: string | Date };
}

export default function ToolRequestApprovedCard({ data }: Props) {
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);
    const actorName = data.content.actor?.name ?? "Someone";

    // SUBJECT: Organization
    const orgName = data.content.organization?.name ?? "Organization";
    const orgId = data.content.organization?.id ?? data.orgId;
    const orgImage = data.content.organization?.image ?? data.content.organization?.logo;
    const orgSubdomain = data.orgSubdomain;

    const actionTitle = "Tool Request Approved"; // action lives in the body

    const displayTitle = data.title || (data.content.title ? `Tool request approved: ${data.content.title}` : "Tool request approved");
    const approvedText = data.content.approvedAt ? formatDates(new Date(data.content.approvedAt)) : createdAt;

    const requestHref = data.content.requestId ? `/app/requests/${data.content.requestId}` : "#";

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

                {/* BODY becomes the feed-style notification content */}
                <CardContent className="p-4 pt-0 space-y-2">
                    {/* Action title inside content */}
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{actionTitle}</span>
                    </div>

                    {/* Description like a realistic notification */}
                    <p className="text-sm text-muted-foreground">
                        {actorName} approved the tool request
                        {data.content.title ? (
                            <>
                                {" "}
                                “<span className="font-medium text-foreground">{data.content.title}</span>”
                            </>
                        ) : null}{" "}
                        for {orgName}. The request is now cleared to proceed.
                    </p>

                    {/* Meta line */}
                    <div className="text-xs md:text-sm text-muted-foreground">
                        Approved: <span className="font-medium">{approvedText}</span>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <Link href={requestHref} aria-disabled={!data.content.requestId} passHref>
                        <Button size="sm" variant="outline" className="flex gap-1 items-center" disabled={!data.content.requestId} title={data.content.requestId ? "View Request" : "No request link available"}>
                            <ExternalLink className="h-4 w-4" />
                            View Request
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
