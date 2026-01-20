"use client"

import React from "react"
import { useShallow } from "zustand/react/shallow";
import InfiniteScroll from "@comend/components/ui/infinite-scroll";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import { Dialog, DialogTrigger } from "@comend/components/plate-ui/dialog";
import { DialogContent } from "@comend/components/ui/dialog";
import { LoaderCircle } from "lucide-react";
import { cn } from "@udecode/cn";
import { ResearchPlanSearchState, useResearchPlanSearchStore } from "@/state/search/researchPlanSearchStore";
import { ResearchPlanCard } from "@comend/components/research-plan-card";
import Link from "next/link";

const selector = (state: ResearchPlanSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults,
    totalResults: state.totalResults
})

export function ResearchPlanSearchResults() {
    const {
        lastFetchedPage, 
        setLastFetchedPage, 
        searchResults,
        totalResults
    } = useResearchPlanSearchStore(useShallow(selector))

    if (!searchResults) {
        return (
            <div className="h-full w-full flex flex-col gap-4">
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
            </div>
        )
    }

    const ResultsView = () => {
        return (
            <div className="w-full flex flex-col gap-4">
                {(!searchResults || searchResults.length === 0) ? (
                    <NoResultsView />
                ): (
                    <div className="w-full flex flex-col gap-4 ">
                        {searchResults.map((researchPlan: any) => (
                            <Link 
                                target="_blank"
                                href={`http://${researchPlan.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${researchPlan.id}`}
                            >
                                <ResearchPlanCard researchPlan={researchPlan} showOrganization={true}/>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <ResultsView />
            <LoaderCircle 
                className={cn("h-[40px] w-[40px] animate-spin", (
                    !searchResults ||
                    searchResults.length === totalResults || 
                    searchResults.length === 0
                ) && "opacity-0")}
            />
            <InfiniteScroll 
                lastFetchedPage={lastFetchedPage} 
                setLastFetchedPage={setLastFetchedPage}
            />
        </>
    )
}
