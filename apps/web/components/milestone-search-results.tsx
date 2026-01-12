"use client"

import React from "react"
import { useShallow } from "zustand/react/shallow";
import { MilestoneSearchState, useMilestoneSearchStore } from "@/state/search/milestoneSearchStore";
import { MilestoneMarketplaceListElement } from "@comend/components/marketplace/marketplace-milestone-list-element";
import { MilestoneMarketplaceCard } from "@comend/components/marketplace/marketplace-milestone-card";
import InfiniteScroll from "@comend/components/ui/infinite-scroll";
import Image from "next/image";
import ComendLoadingSpinner from "../../../packages/components/comend-loading-spinner";
import { NoResultsTemplate } from "@comend/components/no-results";

const selector = (state: MilestoneSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResultsAdd: state.searchResultsAdd,
    searchResultsSub: state.searchResultsSub
})

export function MilestoneSearchResults() {
    const { lastFetchedPage, setLastFetchedPage, view, searchResultsAdd, searchResultsSub } = useMilestoneSearchStore(useShallow(selector))
    console.log(searchResultsAdd)
    console.log(searchResultsSub)

    if (!searchResultsAdd) return <ComendLoadingSpinner />

    const ResultsView = () => {
        if (view === "list") {
            return (
                <ol className="w-full flex flex-col gap-4">
                    {searchResultsAdd.map((milestone, index) => (
                        <MilestoneMarketplaceListElement milestone={milestone} key={index}/>
                    ))}
                </ol>
            )
        }

        // default to grid view
        return (
            <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                {searchResultsAdd.map((milestone, index) => (
                    <MilestoneMarketplaceCard milestone={milestone} key={index} />
                ))}
            </div>
        )
    }
    
    const NoResultsView = () => {
        return (
            <NoResultsTemplate 
                    imgAlt="No results"
                    src="https://illustrations.popsy.co/white/question-mark.svg"
                    title="Sorry, we don't have any results for that search"
                    description="Please try another search."
            />
        )
    }

    return searchResultsAdd && (searchResultsAdd.length > 0) ? (
        <>
            <ResultsView />
            <InfiniteScroll 
                lastFetchedPage={lastFetchedPage} 
                setLastFetchedPage={setLastFetchedPage}
            />
        </>
    ):(
        <NoResultsView />
    )
}
