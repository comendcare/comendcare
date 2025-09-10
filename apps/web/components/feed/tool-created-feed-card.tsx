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
import { cn, formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { Wrench, FileText } from "lucide-react";

interface ToolCreatedContent {
    toolId: string;
    title?: string; // optional display name of the tool
    private?: boolean;
    geneId?: number;
    institutionId?: string;
    types?: string[];
    actor?: {
        userId?: string;
        name?: string;
    };
    organization?: {
        id?: string;
        name?: string;
        image?: string; // <-- allow org image
    };
}

interface ToolCreatedProps {
    data: {
        id: string;
        title: string; // legacy/event title
        content: ToolCreatedContent;
        orgId?: string;
        orgSubdomain?: string;
        createdAt: string | Date;
    };
}

export default function ToolCreatedCard({ data }: ToolCreatedProps) {
    const createdAt = React.useMemo(
        () => formatDates(data.createdAt as Date),
        [data.createdAt]
    );

    const actorName = data.content.actor?.name ?? "Someone";

    // Subject = organization (name, id, image)
    const orgName =
        data.content.organization?.name ?? "Organization";
    const orgId = data.content.organization?.id ?? data.orgId;
    const orgSubdomain = data.orgSubdomain;
    const orgImage = data.content.organization?.image;

    // Action is a title in the Card body (feed-style)
    const actionTitle = "Tool Created";

    // Tool display name (if you want to surface it in the description)
    const toolDisplayName = data.content.title || data.title;

    const types = data.content.types ?? [];
    const isPrivate = !!data.content.private;

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                {/* Header: Organization avatar + name (subject) */}
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ProfilePhoto
                                img={orgImage}
                                name={orgName}
                                className="h-8 w-8 rounded-full"
                            />
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

                {/* Body: Action title + feed-style description */}
                <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <Wrench className="h-4 w-4" />
                        <span>{actionTitle}</span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {actorName} created
                        {isPrivate ? " a private" : " a"}
                        {" tool"}
                        {toolDisplayName ? <> <span className="font-medium">“{toolDisplayName}”</span></> : null}
                        {" for "}
                        <span className="font-medium">{orgName}</span>.
                        {types.length > 0 ? (
                            <> Types: {types.join(", ")}.</>
                        ) : null}
                    </p>

                    {types.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-foreground">
                            {types.map((type, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-0.5 rounded bg-muted text-muted-foreground"
                                >
                  {type}
                </span>
                            ))}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <div className="flex gap-2">
                        {orgSubdomain && (
                            <Link
                                href={`/app/organization/${orgSubdomain}`}
                                passHref
                            >
                                <Button
                                    size="sm"
                                    variant="outline"
                                    title="View Organization"
                                >
                                    <FileText className="h-4 w-4" />
                                    View Organization
                                </Button>
                            </Link>
                        )}

                        {data.content.toolId && (
                            <Link
                                href={`/app/tools/biosample`}
                                passHref
                            >
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex gap-1 items-center"
                                    title="View Tool"
                                >
                                    <FileText className="h-4 w-4" />
                                    View Tool
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
