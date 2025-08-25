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
    BookOpenText,
    ExternalLink,
    Tag,
    User2,
    Library,
} from "lucide-react";

/** Feed type your mapper emits for PubMed */
type PubMedFeedType = "PAPER_PUBLISHED_AGNOSTIC";

type PubMedContent = {
    pmid: string;
    abstract?: string;
    keywords?: string[];
    authors?: string[]; // flattened in mapper
};

interface PubMedFeedCardProps {
    data: {
        id: string;
        type: PubMedFeedType;
        title: string;
        content: PubMedContent | null;
        externalUrl?: string | null; // https://pubmed.ncbi.nlm.nih.gov/<pmid>/
        createdAt: string | Date;
        // source/org/user intentionally ignored to keep PubMed-only branding
        source?: "USER" | "PLATFORM" | "THIRD_PARTY";
        orgId?: string | null;
        userId?: string | null;
    };
}

/** Only allow outbound CTA to pubmed.ncbi.nlm.nih.gov */
function isTrustedPubMedUrl(url?: string | null) {
    if (!url) return false;
    try {
        const u = new URL(url);
        return u.hostname === "pubmed.ncbi.nlm.nih.gov";
    } catch {
        return false;
    }
}

export default function PubMedFeedCard({ data }: PubMedFeedCardProps) {
    const { title, externalUrl, content } = data;

    const createdAt = React.useMemo(
        () => formatDates(data.createdAt as Date),
        [data.createdAt]
    );

    const pmid = content?.pmid ?? "";
    const abstract = (content?.abstract ?? "").trim();
    const authors = (content?.authors ?? []).filter(Boolean);
    const keywords = (content?.keywords ?? []).filter(Boolean);

    // Presentation helpers
    const primaryAuthor = authors[0];
    const extraAuthors = Math.max(0, authors.length - 1);
    const shownKeywords = keywords.slice(0, 6);

    const canLinkOut = isTrustedPubMedUrl(externalUrl);

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                {/* Header: Fixed PubMed/NCBI branding */}
                <CardHeader className="p-4">
                    <div className="flex gap-2 items-center">
                        <ProfilePhoto
                            img={undefined}
                            name="PubMed"
                            className="h-8 w-8 rounded-full"
                        />
                        <div className="flex flex-col">
              <span className="font-medium md:text-base flex items-center gap-1">
                <BookOpenText className="h-4 w-4" aria-hidden="true" />
                PubMed Article
              </span>
                            <span className="font-light text-muted-foreground text-[0.65rem] md:text-xs">
                {createdAt} • by NCBI
              </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm md:text-base font-semibold line-clamp-2">
                            {title || "Untitled"}
                        </h3>

                        {/* Authors */}
                        {authors.length > 0 && (
                            <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                                <User2 className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="truncate">
                  {primaryAuthor}
                                    {extraAuthors > 0 && (
                                        <span className="opacity-80"> &nbsp;+{extraAuthors} more</span>
                                    )}
                </span>
                            </div>
                        )}

                        {/* Abstract */}
                        {!!abstract && (
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-4">
                                {abstract}
                            </p>
                        )}

                        {/* Keywords */}
                        {shownKeywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {shownKeywords.map((k) => (
                                    <Badge
                                        key={k}
                                        variant="secondary"
                                        className="text-[0.65rem] md:text-xs font-normal"
                                    >
                                        <Tag className="h-3 w-3 mr-1" aria-hidden="true" />
                                        {k}
                                    </Badge>
                                ))}
                                {keywords.length > 6 && (
                                    <span className="text-[0.7rem] text-muted-foreground">
                    +{keywords.length - 6} more
                  </span>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center p-4 pt-0">
                    <div className="text-[0.7rem] text-muted-foreground flex items-center gap-2">
                        {pmid ? (
                            <>
                                <Library className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                                <span className="opacity-80">PMID: {pmid}</span>
                            </>
                        ) : (
                            <span className="opacity-60">No PMID</span>
                        )}
                    </div>

                    {canLinkOut ? (
                        <Link href={externalUrl as string} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="flex gap-1 items-center">
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                View on PubMed
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
