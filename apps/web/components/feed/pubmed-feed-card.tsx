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
        source?: "USER" | "PLATFORM" | "THIRD_PARTY";
        orgId?: string | null;
        userId?: string | null;
    };
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

    return (
        <MotionConfig transition={{ duration: 0.3 }}>
            <Card className="rounded-sm w-full">
                <CardHeader className="space-y-1 md:space-y-1.5 p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <ProfilePhoto
                                img={undefined}
                                name="PubMed"
                                className="h-8 w-8 rounded-full"
                            />
                            <div className="flex flex-col">
                <span className="font-medium md:text-base flex items-center gap-1">
                  <BookOpenText className="h-4 w-4" />
                  PubMed Article
                </span>
                                <span className="font-light text-muted-foreground text-[0.6rem] md:text-xs leading-3">
                  {createdAt}
                                    <span className="ml-1">• via NCBI</span>
                </span>
                            </div>
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
                                <User2 className="h-3.5 w-3.5" />
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
                                        <Tag className="h-3 w-3 mr-1" />
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

                <CardFooter className="flex justify-between p-4 pt-0">
                    <div className="text-[0.7rem] text-muted-foreground flex items-center gap-2">
                        {pmid ? (
                            <>
                                <Library className="h-3.5 w-3.5 opacity-80" />
                                <span className="opacity-80">PMID: {pmid}</span>
                            </>
                        ) : (
                            <span className="opacity-60">No PMID</span>
                        )}
                    </div>

                    {externalUrl ? (
                        <Link href={externalUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="flex gap-1 items-center">
                                <ExternalLink className="h-4 w-4" />
                                View on PubMed
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
