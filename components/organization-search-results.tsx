"use client"

import React from "react"
import { OrganizationMarketplaceCard } from "@/components/marketplace-pag-card";
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore";
import { useShallow } from "zustand/react/shallow";
import { OrganizationMarketplaceListElement } from "./marketplace-pag-list-element";
import InfiniteScroll from "./ui/infinite-scroll";
import Image from "next/image";
import ComendLoadingSpinner from "./comend-loading-spinner";
import { useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { NoResultsView } from "./cro-search-results";

const selector = (state: OrganizationSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults
})

export function OrganizationSearchResults() {
    const { lastFetchedPage, setLastFetchedPage, view, searchResults } = useOrganizationSearchStore(useShallow(selector))

    if (!searchResults) return <ComendLoadingSpinner />

    const ResultsView = () => {
        if (view === "list") {
            return (
                <ol className="w-full flex flex-col gap-4">
                    {searchResults.map((organization, index) => (
                        <OrganizationMarketplaceListElement organization={organization} key={index}/>
                    ))}
                </ol>
            )
        }

        // default to grid view
        return (
            <div className="w-full flex flex-col gap-4">
                {(!searchResults || searchResults.length === 0) ? (
                    <NoResultsView />
                ): (
                    <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                        {searchResults.map((organization, index) => (
                            <OrganizationMarketplaceCard organization={organization} key={index} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <ResultsView />
            <InfiniteScroll 
                lastFetchedPage={lastFetchedPage} 
                setLastFetchedPage={setLastFetchedPage}
            />
        </>
    )
}
