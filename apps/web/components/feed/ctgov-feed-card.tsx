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
import { Badge } from "@comend/components/ui/badge";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { formatDates } from "@comend/lib/utils";
import {
    ClipboardList,
    ExternalLink,
    Hash,
    MapPin,
    Tag,
    Globe,
    Newspaper,
} from "lucide-react";

/** Feed type your mapper emits for CT.gov */
type CtgovFeedType = "CTG_TRIAL_POSTED";

type CtgovContent = {
    nctId: string;
    briefTitle?: string;
    status?: string;
    conditions?: string[];
    locations?: string[]; // already flattened in mapper (e.g., "Facility, City, State, Country")
    organization?: { id?: string; name?: string; image?: string };
    actor?: { userId?: string; name?: string }; // optional (user who surfaced/imported)
    host?: string; // e.g., "clinicaltrials.gov"
};

interface CtgovFeedCardProps {
    data: {
        id: string;
        type: CtgovFeedType;
        title: string;
        content: CtgovContent | null;
        externalUrl?: string | null; // https://clinicaltrials.gov/study/<nctId>
        createdAt: string | Date;
        // source/org/user intentionally ignored for branding
        source?: "USER" | "PLATFORM" | "THIRD_PARTY";
        orgId?: string | null;
        userId?: string | null;
    };
}

/** Only allow outbound CTA to clinicaltrials.gov */
function isTrustedCtgovUrl(url?: string | null) {
    if (!url) return false;
    try {
        const u = new URL(url);
        return (
            u.hostname === "clinicaltrials.gov" ||
            u.hostname.endsWith(".clinicaltrials.gov")
        );
    } catch {
        return false;
    }
}

export default function CtgovFeedCard({ data }: CtgovFeedCardProps) {
    const { externalUrl, content } = data;

    const createdAt = React.useMemo(
        () => formatDates(data.createdAt as Date),
        [data.createdAt]
    );

    // Keep org for body content, but header is always ClinicalTrials.gov branding
    const orgName = content?.organization?.name ?? "Related Organization";
    const actorName = content?.actor?.name;

    const host = (content?.host ?? "clinicaltrials.gov").trim();

    const nctId = content?.nctId ?? "";
    const status = (content?.status ?? "").trim();
    const conditions = (content?.conditions ?? []).filter(Boolean);
    const locations = (content?.locations ?? []).filter(Boolean);

    const shownConditions = conditions.slice(0, 6);
    const shownLocations = locations.slice(0, 3);
    const extraLocations = Math.max(0, locations.length - shownLocations.length);

    const actionTitle = "ClinicalTrials.gov Trial Posted";
    const displayHeadline = data.title || content?.briefTitle || "Untitled trial";

    const canLinkOut = isTrustedCtgovUrl(externalUrl);

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                {/* Header: Fixed ClinicalTrials.gov branding */}
                <CardHeader className="p-4">
                    <div className="flex gap-2 items-center">
                        <ProfilePhoto
                            img={"https://www.google.com/s2/favicons?domain=https://clinicaltrials.gov/"}
                            name="ClinicalTrials.gov"
                            className="h-8 w-8 rounded-full"
                        />
                        <div className="flex flex-col">
              <span className="font-medium md:text-base flex items-center gap-1">
                <Newspaper className="h-4 w-4" aria-hidden="true" />
                ClinicalTrials.gov
              </span>
                            <span className="font-light text-muted-foreground text-[0.65rem] md:text-xs">
                {createdAt}
                                {actorName ? (
                                    <span className="ml-1">
                    • by <span className="font-normal">{actorName}</span>
                  </span>
                                ) : (
                                    <span className="ml-1">• official source</span>
                                )}
                                {host && (
                                    <>
                                        {" "}
                                        •{" "}
                                        <a
                                            href={`https://${host}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                                            title={`Open ${host}`}
                                        >
                                            <Globe className="h-3 w-3" aria-hidden="true" />
                                            <span className="truncate">{host}</span>
                                        </a>
                                    </>
                                )}
              </span>
                        </div>
                    </div>
                </CardHeader>

                {/* Body: Action title + feed-style description + details */}
                <CardContent className="p-4 pt-0">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm md:text-base font-semibold">
                            <ClipboardList className="h-4 w-4" aria-hidden="true" />
                            <span>{actionTitle}</span>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            A new clinical trial was posted on ClinicalTrials.gov related to{" "}
                            <span className="font-medium">{orgName}</span>. Review the summary,
                            status, and locations below.
                        </p>

                        <h3 className="text-sm md:text-base font-semibold line-clamp-2">
                            {displayHeadline}
                        </h3>

                        {/* Status */}
                        {!!status && (
                            <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                                <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="truncate">{status}</span>
                            </div>
                        )}

                        {/* Conditions */}
                        {shownConditions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {shownConditions.map((c) => (
                                    <Badge
                                        key={c}
                                        variant="secondary"
                                        className="text-[0.65rem] md:text-xs font-normal"
                                    >
                                        <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
                                        {c}
                                    </Badge>
                                ))}
                                {conditions.length > 6 && (
                                    <span className="text-[0.7rem] text-muted-foreground">
                    +{conditions.length - 6} more
                  </span>
                                )}
                            </div>
                        )}

                        {/* Locations */}
                        {shownLocations.length > 0 && (
                            <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span className="font-medium">Locations:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {shownLocations.map((loc, idx) => (
                                        <Badge
                                            key={`${loc}-${idx}`}
                                            variant="outline"
                                            className="text-[0.65rem] md:text-xs font-normal"
                                        >
                                            {loc}
                                        </Badge>
                                    ))}
                                    {extraLocations > 0 && (
                                        <span className="text-[0.7rem] text-muted-foreground">
                      +{extraLocations} more
                    </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center p-4 pt-0">
                    <div className="text-[0.7rem] text-muted-foreground flex items-center gap-2">
                        {nctId ? (
                            <>
                                <Hash className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                                <span className="opacity-80">NCT ID: {nctId}</span>
                            </>
                        ) : (
                            <span className="opacity-60">No NCT ID</span>
                        )}
                    </div>

                    {canLinkOut ? (
                        <Link
                            href={externalUrl as string}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button size="sm" variant="outline" className="flex gap-1 items-center">
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                View on ClinicalTrials.gov
                            </Button>
                        </Link>
                    ) : (
                        <span className="text-[0.7rem] text-muted-foreground">
              External link unavailable
            </span>
                    )}
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
