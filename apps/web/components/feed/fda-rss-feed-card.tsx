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
    AlertTriangle,
    Pill,
    Syringe,
    Megaphone,
    Newspaper,
    ExternalLink,
    Tag,
} from "lucide-react";

type FDAFeedType =
    | "FDA_MEDWATCH_ALERT"
    | "FDA_WHATS_NEW_DRUGS"
    | "FDA_WHATS_NEW_VBB"
    | "FDA_PRESS_RELEASE";

type FDAContent = {
    guid?: string;
    summary?: string;
    categories?: string[];
};

interface FDAFeedCardProps {
    data: {
        id: string;
        type: FDAFeedType;
        title: string;
        content: FDAContent | null;
        externalUrl?: string | null;
        createdAt: string | Date;
        // source/org/user intentionally ignored to keep FDA-only branding
    };
}

/** Visuals + copy per type (tone reserved for future theming) */
const VISUALS: Record<
    FDAFeedType,
    { label: string; icon: React.ElementType; tone: "warning" | "info" | "loud" }
> = {
    FDA_MEDWATCH_ALERT: {
        label: "FDA MedWatch Safety Alert",
        icon: AlertTriangle,
        tone: "warning",
    },
    FDA_WHATS_NEW_DRUGS: {
        label: "FDA: What's New (Drugs)",
        icon: Pill,
        tone: "info",
    },
    FDA_WHATS_NEW_VBB: {
        label: "FDA: What's New (Biologics)",
        icon: Syringe,
        tone: "info",
    },
    FDA_PRESS_RELEASE: {
        label: "FDA Press Release",
        icon: Megaphone,
        tone: "loud",
    },
};

function isTrustedFDAUrl(url?: string | null) {
    if (!url) return false;
    try {
        const u = new URL(url);
        // allow fda.gov and subdomains (www.fda.gov, www.accessdata.fda.gov, etc.)
        return u.hostname === "fda.gov" || u.hostname.endsWith(".fda.gov");
    } catch {
        return false;
    }
}

export default function FDAFeedCard({ data }: FDAFeedCardProps) {
    const { title, externalUrl, type, content } = data;

    const createdAt = React.useMemo(
        () => formatDates(data.createdAt as Date),
        [data.createdAt]
    );

    const { label, icon: Icon } =
    VISUALS[type] ?? ({ label: "FDA Update", icon: Newspaper } as const);

    const summary = content?.summary?.trim() ?? "";
    const categories = content?.categories?.filter(Boolean) ?? [];
    const canLinkOut = isTrustedFDAUrl(externalUrl);

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                <CardHeader className="p-4">
                    <div className="flex gap-2 items-center">
                        {/* Hard-coded FDA branding */}
                        <ProfilePhoto img={"https://www.google.com/s2/favicons?domain=https://www.fda.gov/"} name="FDA" className="h-8 w-8 rounded-full" />
                        <div className="flex flex-col">
              <span className="font-medium md:text-base flex items-center gap-1">
                <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
              </span>
                            <span className="font-light text-muted-foreground text-[0.65rem] md:text-xs">
                {createdAt} • by FDA
              </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm md:text-base font-semibold line-clamp-2">
                            {title || "Untitled"}
                        </h3>

                        {summary && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-4">
                                {summary}
                            </p>
                        )}

                        {!!categories.length && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {categories.slice(0, 6).map((c) => (
                                    <Badge
                                        key={c}
                                        variant="secondary"
                                        className="text-[0.65rem] md:text-xs font-normal"
                                    >
                                        <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
                                        {c}
                                    </Badge>
                                ))}
                                {categories.length > 6 && (
                                    <span className="text-[0.7rem] text-muted-foreground">
                    +{categories.length - 6} more
                  </span>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center p-4 pt-0">
          <span className="text-[0.7rem] text-muted-foreground">
            {content?.guid ? `GUID: ${content.guid}` : "No GUID"}
          </span>

                    {canLinkOut ? (
                        <Link href={externalUrl as string} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="flex gap-1 items-center">
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                Read on FDA.gov
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
