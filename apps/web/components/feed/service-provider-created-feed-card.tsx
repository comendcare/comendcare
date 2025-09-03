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
    organization?: { id?: string; name?: string; image?: string; logo?: string }; // added for subject header
}

interface Props {
    data: { id: string; title: string; content: Content; orgId?: string; orgSubdomain: string; createdAt: string | Date };
}

export default function ServiceProviderCreatedCard({ data }: Props) {
    const createdAt = React.useMemo(() => formatDates(data.createdAt as Date), [data.createdAt]);
    const actorName = data.content.actor?.name ?? "Someone";

    // SUBJECT: Organization
    const orgName = data.content.organization?.name ?? "Organization";
    const orgSubdomain = data.orgSubdomain;
    const orgId = data.content.organization?.id ?? data.orgId;
    const orgImage = data.content.organization?.image ?? data.content.organization?.logo;

    const actionTitle = "Service Provider Created"; // action lives in body

    const displayTitle = data.title || `New service provider: ${data.content.title}`;

    const companyHref = data.content.companyId ? `/app/service-providers/${data.content.companyId}` : "#";
    const siteHref = data.content.url || "#";
    const hasSite = Boolean(data.content.url);

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

                {/* BODY as feed-style content */}
                <CardContent className="p-4 pt-0 space-y-2">
                    {/* Action title */}
                    <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                        <Building2 className="h-4 w-4" />
                        <span>{actionTitle}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                        {actorName} added a new service provider
                        {displayTitle ? (
                            <>
                                {" "}
                                “<span className="font-medium text-foreground">{displayTitle}</span>”
                            </>
                        ) : null}{" "}
                        for {orgName}. You can review details, assign contacts, and track milestones.
                    </p>

                    {/* Quick facts */}
                    <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                        {data.content.companyType && (
                            <div>
                                Type: <span className="font-medium">{data.content.companyType}</span>
                            </div>
                        )}
                        {data.content.headquarters && (
                            <div>
                                HQ: <span className="font-medium">{data.content.headquarters}</span>
                            </div>
                        )}
                        {typeof data.content.yearEstablished === "number" && (
                            <div>
                                Established: <span className="font-medium">{data.content.yearEstablished}</span>
                            </div>
                        )}
                        {Array.isArray(data.content.services) && data.content.services.length > 0 && (
                            <div>
                                Services: <span className="font-medium">{data.content.services.join(", ")}</span>
                            </div>
                        )}
                        {Array.isArray(data.content.certifications) && data.content.certifications.length > 0 && (
                            <div>
                                Certifications: <span className="font-medium">{data.content.certifications.join(", ")}</span>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                    <Link href={companyHref} aria-disabled={!data.content.companyId} passHref>
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex gap-1 items-center"
                            disabled={!data.content.companyId}
                            title={data.content.companyId ? "View Company" : "No company link available"}
                        >
                            <ExternalLink className="h-4 w-4" />
                            View Company
                        </Button>
                    </Link>
                    <Link href={siteHref} aria-disabled={!hasSite} passHref>
                        <Button size="sm" variant="ghost" className="flex gap-1 items-center" disabled={!hasSite} title={hasSite ? "Open Website" : "No website available"}>
                            <ExternalLink className="h-4 w-4" />
                            Visit Site
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
