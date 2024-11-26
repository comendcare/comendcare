"use client"

import React from "react"
import { OrganizationMarketplaceCard } from "@/components/marketplace-pag-card";
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore";
import { useShallow } from "zustand/react/shallow";
import { OrganizationMarketplaceListElement } from "./marketplace-pag-list-element";
import InfiniteScroll from "./ui/infinite-scroll";

const selector = (state: OrganizationSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults
})

export function OrganizationSearchResults() {
    const { lastFetchedPage, setLastFetchedPage, view, searchResults } = useOrganizationSearchStore(useShallow(selector))

    const ResultsView = () => {
        if (view === "list") {
            return (
                <ol className="w-full flex flex-col gap-4">
                    {searchResults.map((organization, index) => (
                        <OrganizationMarketplaceListElement organization={organization.document} key={index}/>
                    ))}
                </ol>
            )
        }

        // default to grid view
        return (
            <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                {searchResults.map((organization, index) => (
                    <OrganizationMarketplaceCard organization={organization.document} key={index} />
                ))}
            </div>
        )
    }
    
    const NoResultsView = () => {
        return (
            <div className="h-full w-full flex justify-center align-center">
                <p className="text-3xl p-10">
                    {`Sorry, we don't have any results for that search`}
                </p>
            </div>
        )
    }

    return searchResults.length > 0 ? (
        <>
            <ResultsView />
            {/* <InfiniteScroll 
                lastFetchedPage={lastFetchedPage} 
                setLastFetchedPage={setLastFetchedPage}
            /> */}
        </>
    ):(
        <NoResultsView />
    )
}