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
    title?: string;
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
    };
}

interface ToolCreatedProps {
    data: {
        id: string;
        title: string;
        content: ToolCreatedContent;
        orgId?: string;
        createdAt: string | Date;
    };
}

export default function ToolCreatedCard({ data }: ToolCreatedProps) {
    const createdAt = React.useMemo(
        () => formatDates(data.createdAt as Date),
        [data.createdAt]
    );

    const actorName = data.content.actor?.name ?? "Someone";
    const orgName = data.content.organization?.name;
    const orgId = data.content.organization?.id ?? data.orgId;

    const displayTitle = data.content.title || data.title;

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <ProfilePhoto
                                img={undefined}
                                name={actorName}
                                className="h-8 w-8 rounded-full"
                            />
                            <div className="flex flex-col">
                                <span className="font-medium md:text-base">New Tool Created</span>
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
                                                <Link
                                                    href={`/org/${orgId}`}
                                                    className="underline-offset-2 hover:underline"
                                                >
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

                <CardContent className="p-4 pt-0">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm md:text-base font-semibold">{displayTitle}</h3>

                        {data.content.types && data.content.types.length > 0 && (
                            <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                                {data.content.types.map((type, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded bg-muted text-muted-foreground"
                                    >
                    {type}
                  </span>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <Link href={`/app/tool/${data.content.toolId}`} passHref>
                        <Button size="sm" variant="outline" className="flex gap-1 items-center">
                            <FileText className="h-4 w-4" />
                            View Tool
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
