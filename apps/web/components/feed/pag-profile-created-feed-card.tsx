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
import { Building2, FileText } from "lucide-react";

interface PagProfileCreatedContent {
    pagOrganizationId: string;
    pagOrganizationName?: string;
    pagOrganizationSubdomain?: string;
    pagOrganizationImage?: string;
    actor?: {
        userId?: string;
        name?: string;
    };
    organization?: {
        id?: string;
        name?: string;
        image?: string;
    };
}

interface PagProfileCreatedProps {
    data: {
        id: string;
        title: string;
        content: PagProfileCreatedContent;
        orgId?: string;
        createdAt: string | Date;
    };
}

export default function PAGProfileCreatedCard({ data }: PagProfileCreatedProps) {
    const createdAt = React.useMemo(
        () => formatDates(data.createdAt as Date),
        [data.createdAt]
    );

    const actorName = data.content.actor?.name ?? "Someone";
    const orgName =
        data.content.pagOrganizationName ?? data.content.organization?.name ?? "Organization";
    const orgSubdomain =
        data.content.pagOrganizationSubdomain ?? data.content.pagOrganizationSubdomain ?? "";
    const orgId =
        data.content.organization?.id ??
        data.content.pagOrganizationId ??
        data.orgId;
    const orgImage = data.content.organization?.image ?? data.content.pagOrganizationImage;

    // Display title is now the action title inside CardContent.
    const actionTitle = "PAG Profile Created";

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                {/* Header now focuses on the SUBJECT: the Organization */}
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Organization avatar */}
                            <ProfilePhoto
                                img={orgImage}
                                name={orgName}
                                className="h-8 w-8 rounded-full"
                            />

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

                {/* Card body becomes the notification feed-style content */}
                <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <Building2 className="h-4 w-4" />
                        <span>{actionTitle}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {actorName} created a PAG profile for {orgName}. You can review the
                        profile details, add team members, and configure integrations.
                    </p>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <Link href={orgSubdomain ? `/app/organization/${orgSubdomain}` : "#"} aria-disabled={!orgSubdomain} passHref>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex gap-1 items-center"
                            disabled={!orgSubdomain}
                            title={orgSubdomain ? "View PAG Profile" : "No profile link available"}
                        >
                            <FileText className="h-4 w-4" />
                            View profile
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
