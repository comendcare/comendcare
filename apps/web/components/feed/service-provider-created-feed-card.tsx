"use client";

import * as React from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@comend/components/ui/card";
import { Button } from "@comend/components/ui/button";
import { formatDates } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { Building2, ExternalLink } from "lucide-react";

interface Content {
    companyId: string;
    title: string;
    url?: string;
    companyType?: string;
    categories?: string[];
    milestoneTypes?: string[];
    services?: string[];
    certifications?: string[];
    tags?: string[];
    headquarters?: string;
    yearEstablished?: number | null;
    actor?: { userId?: string; name?: string };
}

interface Props {
    data: { id: string; title: string; content: Content; orgId?: string; createdAt: string | Date };
}

export default function ServiceProviderCreatedCard({ data }: Props) {
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);
    const actorName = data.content.actor?.name ?? "Someone";

    const displayTitle = data.title || `New service provider: ${data.content.title}`;

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <ProfilePhoto img={undefined} name={actorName} className="h-8 w-8 rounded-full" />
                            <div className="flex flex-col">
                                <span className="font-medium md:text-base">Service Provider Created</span>
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

                <CardContent className="p-4 pt-0 space-y-2">
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <Building2 className="h-4 w-4" />
                        <span>{displayTitle}</span>
                    </div>

                    <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                        {data.content.companyType && <div>Type: <span className="font-medium">{data.content.companyType}</span></div>}
                        {data.content.headquarters && <div>HQ: <span className="font-medium">{data.content.headquarters}</span></div>}
                        {Array.isArray(data.content.services) && data.content.services.length > 0 && (
                            <div>Services: <span className="font-medium">{data.content.services.join(", ")}</span></div>
                        )}
                        {Array.isArray(data.content.certifications) && data.content.certifications.length > 0 && (
                            <div>Certifications: <span className="font-medium">{data.content.certifications.join(", ")}</span></div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end p-4 pt-0">
                    <Link href={data.content.companyId ? `/companies/${data.content.companyId}` : "#"} aria-disabled={!data.content.companyId} passHref>
                        <Button size="sm" variant="outline" className="flex gap-1 items-center" disabled={!data.content.companyId}>
                            <ExternalLink className="h-4 w-4" />
                            View Company
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
