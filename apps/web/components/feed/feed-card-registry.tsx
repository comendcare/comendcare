"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import type { FeedItemDTO, FeedItemType } from "@comend/lib/types";

// Existing cards
import RFPCreatedCard from "~web/components/feed/rfp-created-feed-card";
import ResearchPlanCreatedCard from "~web/components/feed/research-plan-created-feed-card";
import ToolCreatedCard from "~web/components/feed/tool-created-feed-card";
import PAGProfileCreatedCard from "~web/components/feed/pag-profile-created-feed-card";
import PAGProfileUpdatedCard from "~web/components/feed/pag-profile-updated-feed-card";
import ResearchPlanUpdatedCard from "~web/components/feed/research-plan-updated-feed-card";
import PubMedFeedCard from "~web/components/feed/pubmed-feed-card";

// Lazy-load rare/heavier cards
const FDAFeedCard = dynamic(
    () => import("~web/components/feed/fda-rss-feed-card"), // <- the flexible FDA card we made
    { ssr: false }
);
// const CtgovTrialCard = dynamic(() => import("~web/components/feed/CtgovTrialCard"), { ssr: false });

export type CardProps<TContent = any> = { data: FeedItemDTO & { content: TContent } };

// Central registry: map FeedItemType -> Card component
const registry: Partial<Record<FeedItemType, React.ComponentType<CardProps>>> = {
    // Org / internal
    ORG_CREATED_RFP: RFPCreatedCard as React.ComponentType<CardProps>,
    ORG_CREATED_TOOL: ToolCreatedCard as React.ComponentType<CardProps>,
    ORG_RESEARCH_PLAN_CREATED: ResearchPlanCreatedCard as React.ComponentType<CardProps>,
    PAG_PROFILE_CREATED: PAGProfileCreatedCard as React.ComponentType<CardProps>,
    ORG_UPDATED: PAGProfileUpdatedCard as React.ComponentType<CardProps>,
    ORG_RESEARCH_PLAN_UPDATED: ResearchPlanUpdatedCard as React.ComponentType<CardProps>,

    // FDA (all four types go to the same flexible card)
    FDA_MEDWATCH_ALERT: FDAFeedCard as React.ComponentType<CardProps>,
    FDA_WHATS_NEW_DRUGS: FDAFeedCard as React.ComponentType<CardProps>,
    FDA_WHATS_NEW_VBB: FDAFeedCard as React.ComponentType<CardProps>,
    FDA_PRESS_RELEASE: FDAFeedCard as React.ComponentType<CardProps>,

    // PubMed
    PAPER_PUBLISHED_AGNOSTIC: PubMedFeedCard as React.ComponentType<CardProps>,

    // CTG_TRIAL_POSTED: CtgovTrialCard as React.ComponentType<CardProps>,
    // ...add more as you implement them
};

export function FeedCard({ item }: { item: FeedItemDTO }) {
    const Cmp = registry[item.type];
    if (Cmp) return <Cmp data={item as any} />;

    // Fallback generic card
    return (
        <div className="border rounded-sm p-4 w-full">
            <div className="text-xs text-muted-foreground">{item.type}</div>
            <h3 className="text-sm font-semibold mt-1">{item.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
                {new Date(item.createdAt).toLocaleString()}
            </p>
        </div>
    );
}
