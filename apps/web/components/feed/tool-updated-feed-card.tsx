"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { Wrench, ExternalLink } from "lucide-react";

interface OrgUpdatedToolContent {
    toolId: string;
    title?: string;
    private?: boolean;
    geneId?: number;
    institutionId?: string;
    types?: string[];
    actor?: { userId?: string; name?: string };
    organization?: { id?: string; name?: string };
}

interface Props {
    data: {
        id: string;
        title: string;
        content: OrgUpdatedToolContent;
        orgId?: string;
        orgSubdomain?: string;
        createdAt: string | Date;
    };
}

export default function ToolUpdatedCard({ data }: Props) {
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);

    const actorName = data.content.actor?.name ?? "Someone";
    const orgName = data.content.organization?.name;
    const orgSubdomain = data.orgSubdomain;
    const orgId = data.content.organization?.id ?? data.orgId;

    const toolId = data.content.toolId;
    const displayTitle = data.title || (data.content.title ? `Tool updated: ${data.content.title}` : "Tool updated");

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <ProfilePhoto img={undefined} name={actorName} className="h-8 w-8 rounded-full" />
                            <div className="flex flex-col">
                                <span className="font-medium md:text-base">Tool Updated</span>
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
                                            {orgSubdomain ? (
                                                <Link href={`/app/organization/${orgSubdomain}`} className="underline-offset-2 hover:underline">
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
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <Wrench className="h-4 w-4" />
                        <span>{displayTitle}</span>
                    </div>
                    {data.content.types && data.content.types.length > 0 && (
                        <div className="mt-2 text-xs md:text-sm text-muted-foreground">
                            Types: {data.content.types.join(", ")}
                        </div>
                    )}
                </CardContent>

                {toolId && (
                    <CardFooter className="flex justify-end p-4 pt-0">
                        <Link href={toolId ? `/app/tools/biosample` : "#"} aria-disabled={!toolId} passHref>
                            <Button size="sm" variant="outline" className="flex gap-1 items-center">
                                <ExternalLink className="h-4 w-4" />
                                View Tool
                            </Button>
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </MotionConfig>
    );
}
