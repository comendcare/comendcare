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
            <div className="h-full w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
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
                    <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                        {searchResults.map((researchPlan: any) => (
                            <Dialog>
                                <DialogTrigger
                                    className="w-full max-w-full h-full"
                                >
                                    {/* <RFPCard rfp={researchPlan} showOrganization={true}/> */}
                                    <p>{researchPlan.title}</p>
                                </DialogTrigger>
                                <DialogContent className="overflow-hidden" data-testid="dialog">
                                    {/* <RFPDetails rfp={researchPlan}/> */}
                                    <p>{researchPlan.title}</p>
                                </DialogContent>
                            </Dialog>
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
