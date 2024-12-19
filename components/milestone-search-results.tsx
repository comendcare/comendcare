"use client"

import React from "react"
import { useShallow } from "zustand/react/shallow";
import { MilestoneSearchState, useMilestoneSearchStore } from "@/state/search/milestoneSearchStore";
import { MilestoneMarketplaceListElement } from "./marketplace-milestone-list-element";
import { MilestoneMarketplaceCard } from "./marketplace-milestone-card";
import InfiniteScroll from "./ui/infinite-scroll";
import Image from "next/image";
import ComendLoadingSpinner from "./comend-loading-spinner";

const selector = (state: MilestoneSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults
})

export function MilestoneSearchResults() {
    const { lastFetchedPage, setLastFetchedPage, view, searchResults } = useMilestoneSearchStore(useShallow(selector))

    if (!searchResults) return <ComendLoadingSpinner />

    const ResultsView = () => {
        if (view === "list") {
            return (
                <ol className="w-full flex flex-col gap-4">
                    {searchResults.map((milestone, index) => (
                        <MilestoneMarketplaceListElement milestone={milestone.document} key={index}/>
                    ))}
                </ol>
            )
        }

        // default to grid view
        return (
            <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                {searchResults.map((milestone, index) => (
                    <MilestoneMarketplaceCard milestone={milestone.document} key={index} />
                ))}
            </div>
        )
    }
    
    const NoResultsView = () => {
        return (
            <div className="h-full w-full flex flex-col mx-auto justify-center items-center align-center">
                <Image
                    alt="No organization"
                    src="https://illustrations.popsy.co/gray/question-mark.svg"
                    width={400}
                    height={400}
                    className="dark:hidden"
                />
                <Image
                    alt="No organization"
                    src="https://illustrations.popsy.co/white/question-mark.svg"
                    width={400}
                    height={400}
                    className="hidden dark:block"
                />
                <p className="text-3xl p-10">
                    {`Sorry, we don't have any results for that search`}
                </p>
            </div>
        )
    }

    return searchResults && (searchResults.length > 0) ? (
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