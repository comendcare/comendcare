"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { CalendarX2, ExternalLink } from "lucide-react";

interface Content {
    rfpId: string;
    title: string;
    deadline?: string;
    closedAt?: string | Date;
    actor?: { userId?: string; name?: string };
    organization?: { id?: string; name?: string; image?: string; logo?: string };
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

export default function RfpClosedCard({ data }: Props) {
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);
    const actorName = data.content.actor?.name ?? "Someone";
    const orgName = data.content.organization?.name ?? "Organization";
    const orgId = data.content.organization?.id ?? data.orgId;
    const orgImage = data.content.organization?.image ?? data.content.organization?.logo;

    const actionTitle = "RFP Closed"; // action lives in the body
    const displayTitle = data.content.title || data.title;

    const closedText = React.useMemo(() => {
        const when = data.content.closedAt ? new Date(data.content.closedAt) : (data.createdAt as Date);
        return formatDates(when);
    }, [data.content.closedAt, data.createdAt]);

    const deadlineText = data.content.deadline ? formatDates(new Date(data.content.deadline)) : undefined;

    const rfpHref = data.content.rfpId ? `/rfp/${data.content.rfpId}` : "#";

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                {/* HEADER focuses on the SUBJECT: the Organization */}
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            {/* Organization avatar/logo */}
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
                <CardContent className="p-4 pt-0 space-y-2">
                    {/* Action title inside content */}
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <CalendarX2 className="h-4 w-4" />
                        <span>{actionTitle}</span>
                    </div>

                    {/* Description like a realistic notification */}
                    <p className="text-sm text-muted-foreground">
                        {actorName} closed the RFP
                        {displayTitle ? (
                            <>
                                {" "}
                                “<span className="font-medium text-foreground">{displayTitle}</span>”
                            </>
                        ) : null}{" "}
                        for {orgName}. This RFP is no longer accepting submissions.
                    </p>

                    <div className="text-xs md:text-sm text-muted-foreground">
                        Closed: <span className="font-medium">{closedText}</span>
                        {deadlineText && (
                            <>
                                {" "}• Deadline was <span className="font-medium">{deadlineText}</span>
                            </>
                        )}
                    </div>
                </CardContent>

                {/*<CardFooter className="flex justify-end p-4 pt-0">*/}
                {/*    <Link href={rfpHref} aria-disabled={!data.content.rfpId} passHref>*/}
                {/*        <Button size="sm" variant="outline" className="flex gap-1 items-center" disabled={!data.content.rfpId} title={data.content.rfpId ? "View RFP" : "No RFP link available"}>*/}
                {/*            <ExternalLink className="h-4 w-4" />*/}
                {/*            View RFP*/}
                {/*        </Button>*/}
                {/*    </Link>*/}
                {/*</CardFooter>*/}
            </Card>
        </MotionConfig>
    );
}
