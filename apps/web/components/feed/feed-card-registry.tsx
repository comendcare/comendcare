"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import type { FeedItemDTO, FeedItemType } from "@comend/lib/types";
import RFPCreatedCard from "~web/components/feed/rfp-created-feed-card";
import ResearchPlanCreatedCard from "~web/components/feed/research-plan-created-feed-card";
import ToolCreatedCard from "~web/components/feed/tool-created-feed-card";
import PAGProfileCreatedCard from "~web/components/feed/pag-profile-created-feed-card";
import PAGProfileUpdatedCard from "~web/components/feed/pag-profile-updated-feed-card";
import ResearchPlanUpdatedCard from "~web/components/feed/research-plan-updated-feed-card";
import PubMedFeedCard from "~web/components/feed/pubmed-feed-card";
import CtgovFeedCard from "~web/components/feed/ctgov-feed-card";
import ToolUpdatedCard from "~web/components/feed/tool-updated-feed-card";
import ProjectCreatedCard from "~web/components/feed/project-created-feed-card";
import ProjectUpdatedCard from "~web/components/feed/project-updated-feed-card";
import RfpDeadlineApproachingCard from "~web/components/feed/rfp-deadline-approaching-feed-card";
import RfpClosedCard from "~web/components/feed/rfp-closed-feed-card";
import ToolRequestCreatedCard from "~web/components/feed/tool-request-created-feed-card";
import ToolRequestCommentCard from "~web/components/feed/tool-request-comment-created-feed-card";
import ToolRequestApprovedCard from "~web/components/feed/tool-request-approved-feed-card";
import ServiceProviderCreatedCard from "~web/components/feed/service-provider-created-feed-card";
import AnalyticsGoalReachedCard from "~web/components/feed/analytics-goal-reached-feed-card";

// Lazy-load rare/heavier cards
const FDAFeedCard = dynamic(
    () => import("~web/components/feed/fda-rss-feed-card"),
    { ssr: false }
);

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
    ORG_UPDATED_TOOL: ToolUpdatedCard as React.ComponentType<CardProps>,
    ORG_CREATED_PROJECT: ProjectCreatedCard as React.ComponentType<CardProps>,
    ORG_UPDATED_PROJECT: ProjectUpdatedCard as React.ComponentType<CardProps>,
    RFP_DEADLINE_APPROACHING: RfpDeadlineApproachingCard as React.ComponentType<CardProps>,
    RFP_CLOSED: RfpClosedCard as React.ComponentType<CardProps>,
    TOOL_REQUEST_CREATED: ToolRequestCreatedCard as React.ComponentType<CardProps>,
    TOOL_REQUEST_COMMENT_CREATED: ToolRequestCommentCard as React.ComponentType<CardProps>,
    TOOL_REQUEST_APPROVED: ToolRequestApprovedCard as React.ComponentType<CardProps>,
    SERVICE_PROVIDER_CREATED: ServiceProviderCreatedCard as React.ComponentType<CardProps>,
    ANALYTICS_GOAL_REACHED: AnalyticsGoalReachedCard as React.ComponentType<CardProps>,

    // FDA (all four types go to the same flexible card)
    FDA_MEDWATCH_ALERT: FDAFeedCard as React.ComponentType<CardProps>,
    FDA_WHATS_NEW_DRUGS: FDAFeedCard as React.ComponentType<CardProps>,
    FDA_WHATS_NEW_VBB: FDAFeedCard as React.ComponentType<CardProps>,
    FDA_PRESS_RELEASE: FDAFeedCard as React.ComponentType<CardProps>,

    // PubMed
    PAPER_PUBLISHED_AGNOSTIC: PubMedFeedCard as React.ComponentType<CardProps>,

    // Trials
    CTG_TRIAL_POSTED: CtgovFeedCard as React.ComponentType<CardProps>,
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
