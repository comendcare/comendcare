"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import type { FeedItemDTO, FeedItemType } from "@comend/lib/types";


// Import the card you already have
import RFPCreatedCard from "~web/components/feed/rfp-created-feed-card";
import ResearchPlanCreatedCard from "~web/components/feed/research-plan-created-feed-card";


// Optional: code-split heavier/rare cards
// const FdaMedWatchCard = dynamic(() => import("~web/components/feed/FdaMedWatchCard").then(m => m.FdaMedWatchCard), { ssr: false });
// const CtgovTrialCard = dynamic(() => import("~web/components/feed/CtgovTrialCard").then(m => m.CtgovTrialCard), { ssr: false });


export type CardProps<TContent = any> = { data: FeedItemDTO & { content: TContent } };


// Registry mapping types to renderers
const registry: Partial<Record<FeedItemType, React.ComponentType<CardProps>>> = {
    RFP_CREATED: RFPCreatedCard as React.ComponentType<CardProps>,
    ORG_RESEARCH_PLAN_CREATED : ResearchPlanCreatedCard as React.ComponentType<CardProps>,
    // FDA_MEDWATCH_ALERT: FdaMedWatchCard as React.ComponentType<CardProps>,
    // CTG_TRIAL_POSTED: CtgovTrialCard as React.ComponentType<CardProps>,
// ...add the rest as you build them
};


export function FeedCard({ item }: { item: FeedItemDTO }) {
    const Cmp = registry[item.type];
    if (Cmp) return <Cmp data={item as any} />;


// Fallback generic card
    return (
        <div className="border rounded-sm p-4 w-full">
            <div className="text-xs text-muted-foreground">{item.type}</div>
            <h3 className="text-sm font-semibold mt-1">{item.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleString()}</p>
        </div>
    );
}
