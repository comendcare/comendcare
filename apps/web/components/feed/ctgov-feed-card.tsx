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
} from "lucide-react";

/** Feed type your mapper emits for CT.gov */
type CtgovFeedType = "CTG_TRIAL_POSTED";

type CtgovContent = {
    nctId: string;
    briefTitle?: string;
    status?: string;
    conditions?: string[];
    locations?: string[]; // already flattened in mapper (e.g., "Facility, City, State, Country")
};

interface CtgovFeedCardProps {
    data: {
        id: string;
        type: CtgovFeedType;
        title: string;
        content: CtgovContent | null;
        externalUrl?: string | null; // https://clinicaltrials.gov/study/<nctId>
        createdAt: string | Date;
        source?: "USER" | "PLATFORM" | "THIRD_PARTY";
        orgId?: string | null;
        userId?: string | null;
    };
}

export default function CtgovFeedCard({ data }: CtgovFeedCardProps) {
    const { title, externalUrl, content } = data;

    const createdAt = React.useMemo(
        () => formatDates(data.createdAt as Date),
        [data.createdAt]
    );

    const nctId = content?.nctId ?? "";
    const status = (content?.status ?? "").trim();
    const conditions = (content?.conditions ?? []).filter(Boolean);
    const locations = (content?.locations ?? []).filter(Boolean);

    const shownConditions = conditions.slice(0, 6);
    const shownLocations = locations.slice(0, 3);
    const extraLocations = Math.max(0, locations.length - shownLocations.length);

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <ProfilePhoto
                                img={undefined}
                                name="ClinicalTrials.gov"
                                className="h-8 w-8 rounded-full"
                            />
                            <div className="flex flex-col">
                <span className="font-medium md:text-base flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" />
                  ClinicalTrials.gov Trial
                </span>
                                <span className="font-light text-muted-foreground text-[0.6rem] md:text-xs leading-3">
                  {createdAt}
                                    <span className="ml-1">• via ClinicalTrials.gov</span>
                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm md:text-base font-semibold line-clamp-2">
                            {title || content?.briefTitle || "Untitled trial"}
                        </h3>

                        {/* Status */}
                        {!!status && (
                            <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                                <ClipboardList className="h-3.5 w-3.5" />
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
                                        <Tag className="h-3 w-3 mr-1" />
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
                                    <MapPin className="h-3.5 w-3.5" />
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

                <CardFooter className="flex justify-between p-4 pt-0">
                    <div className="text-[0.7rem] text-muted-foreground flex items-center gap-2">
                        {nctId ? (
                            <>
                                <Hash className="h-3.5 w-3.5 opacity-80" />
                                <span className="opacity-80">NCT ID: {nctId}</span>
                            </>
                        ) : (
                            <span className="opacity-60">No NCT ID</span>
                        )}
                    </div>

                    {externalUrl ? (
                        <Link href={externalUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="flex gap-1 items-center">
                                <ExternalLink className="h-4 w-4" />
                                View on ClinicalTrials.gov
                            </Button>
                        </Link>
                    ) : (
                        <div className="text-[0.7rem] text-muted-foreground">
                            External link unavailable
                        </div>
                    )}
                </CardFooter>
            </Card>
        </MotionConfig>
    );
}
