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
import { Building2, UserPlus, Mail, Users } from "lucide-react";

interface InvitationAcceptedContent {
    organization?: {
        id?: string;
        name?: string;
        subdomain?: string;
        image?: string;
    };
    user?: {
        userId?: string;
        name?: string;
        email?: string;
    };
}

interface InvitationAcceptedProps {
    data: {
        id: string;
        title: string; // e.g. "🎉 Jane Doe has joined your organization!"
        content: InvitationAcceptedContent;
        orgId?: string;
        createdAt: string | Date;
    };
}

export default function InvitationAcceptedCard({ data }: InvitationAcceptedProps) {
    const createdAt = React.useMemo(
        () => formatDates(data.createdAt as Date),
        [data.createdAt]
    );

    const orgId =
        data.content.organization?.id ?? data.orgId ?? undefined;
    const orgName =
        data.content.organization?.name ?? "Your Organization";
    const orgSubdomain = data.content.organization?.subdomain ?? "";
    const orgImage = data.content.organization?.image;

    const actorName = data.content.user?.name ?? "A new member";
    const actorEmail = data.content.user?.email;

    // Consistent with your other cards: show a subject-focused header (the Organization)
    const actionTitle = "Invitation Accepted";

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ProfilePhoto
                                img={orgImage}
                                name={orgName}
                                className="h-8 w-8 rounded-full"
                            />
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
                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <UserPlus className="h-4 w-4" />
                        <span>{actionTitle}</span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">{actorName}</span> has joined{" "}
                        <span className="font-medium">{orgName}</span>.
                    </p>

                    {actorEmail && (
                        <div className="mt-2 flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{actorEmail}</span>
                        </div>
                    )}

                    <div className="mt-3 flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>Membership created and invitation closed.</span>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <div className="flex gap-2">
                        {orgSubdomain ? (
                            <Link
                                href={`/app/organization/${orgSubdomain}`}
                                aria-disabled={!orgSubdomain}
                                passHref
                            >
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex gap-1 items-center"
                                    title="View organization"
                                >
                                    <Building2 className="h-4 w-4" />
                                    View org
                                </Button>
                            </Link>
                        ) : null}
                        <Link href="/app/team" passHref>
                            <Button
                                size="sm"
                                variant="default"
                                className="flex gap-1 items-center"
                                title="Manage members"
                            >
                                <Users className="h-4 w-4" />
                                Manage members
                            </Button>
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
