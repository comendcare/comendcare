"use client"

import React from "react"
import { useShallow } from "zustand/react/shallow";
import InfiniteScroll from "@comend/components/ui/infinite-scroll";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import { RFPSearchState, useRFPSearchStore } from "@/state/search/rfpSearchStore";
import { RFPCard } from "~web/components/rfp-card";
import { Dialog, DialogTrigger } from "@comend/components/plate-ui/dialog";
import { mixpanelTrack } from "@comend/lib/mixpanel";
import { DialogContent } from "@comend/components/ui/dialog";
import { RFPDetails } from "~web/components/pag-profile-rfps-card";
import { LoaderCircle } from "lucide-react";
import { cn } from "@udecode/cn";

const selector = (state: RFPSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults,
    totalResults: state.totalResults
})

export function RFPSearchResults() {
    const {
        lastFetchedPage, 
        setLastFetchedPage, 
        searchResults,
        totalResults
    } = useRFPSearchStore(useShallow(selector))

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
                        {searchResults.map((rfp) => (
                            <Dialog>
                                <DialogTrigger
                                    className="w-full max-w-full h-full"
                                    onClick={() => {
                                        mixpanelTrack("RFP Details Viewed", {
                                            "ID": rfp.id,
                                            "Name": rfp.title,
                                            "Budget": rfp.budget,
                                            "Linked Projects": rfp.milestones.map(({milestone}: any) => milestone),
                                            // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                                            // we flatten them into a single list that can be parsed
                                            "Linked Project Types": rfp.milestones.flatMap(({milestone}: any) =>
                                                (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                                            ),
                                            "Location": "marketplace"
                                        })
                                    }}
                                    data-testid="rfp-card-trigger"
                                >
                                    <RFPCard rfp={rfp} showOrganization={true}/>
                                </DialogTrigger>
                                <DialogContent className="overflow-hidden" data-testid="dialog">
                                    <RFPDetails rfp={rfp}/>
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
