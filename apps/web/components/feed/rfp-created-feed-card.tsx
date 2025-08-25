"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { Calendar, FileText } from "lucide-react";

interface RFPCreatedContent {
    rfpId: string;
    title?: string;
    deadline?: string; // ISO
    actor?: {
        userId?: string;
        name?: string;
        // img?: string; // add if/when you store user avatars
    };
    organization?: {
        id?: string;
        name?: string;
        image?: string; // prefer image if/when stored
        logo?: string; // fallback
    };
    // budget?: number;
    // startDate?: string;
    // private?: boolean;
}

interface RfpCreatedProps {
    data: {
        id: string;
        title: string;
        content: RFPCreatedContent;
        orgId?: string;
        createdAt: string | Date;
    };
}

export default function RFPCreatedCard({ data }: RfpCreatedProps) {
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);

    const deadline = data.content.deadline ? formatDates(new Date(data.content.deadline)) : null;

    const actorName = data.content.actor?.name ?? "Someone";
    const orgName = data.content.organization?.name ?? "Organization";
    const orgId = data.content.organization?.id ?? data.orgId;
    const orgImage = data.content.organization?.image ?? data.content.organization?.logo;

    // Prefer event content title (if mapper set it), else top-level title
    const displayTitle = data.content.title || data.title;

    const actionTitle = "RFP Created"; // action now belongs in the card body

    const rfpHref = data.content.rfpId ? `/app/rfp/${data.content.rfpId}` : "#";

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
                                {orgId ? (
                                    <Link href={`/org/${orgId}`} className="font-medium md:text-base underline-offset-2 hover:underline">
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

                {/* BODY is a feed-style notification */}
                <CardContent className="p-4 pt-0">
                    {/* Action title inside the content */}
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <Calendar className="h-4 w-4" />
                        <span>{actionTitle}</span>
                    </div>

                    {/* Description like a realistic feed item */}
                    <p className="mt-2 text-sm text-muted-foreground">
                        {actorName} created a new RFP
                        {displayTitle ? (
                            <>
                                {" "}
                                “<span className="font-medium text-foreground">{displayTitle}</span>”
                            </>
                        ) : null}{" "}
                        for {orgName}. {deadline ? (
                        <>Submissions are due by <span className="font-medium">{deadline}</span>.</>
                    ) : (
                        <>The submission deadline has not been set.</>
                    )}
                    </p>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <Link href={rfpHref} aria-disabled={!data.content.rfpId} passHref>
                        <Button size="sm" variant="outline" className="flex gap-1 items-center" disabled={!data.content.rfpId} title={data.content.rfpId ? "View RFP" : "No RFP link available"}>
                            <FileText className="h-4 w-4" />
                            View RFP
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
