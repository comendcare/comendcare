"use client"

import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"
import { OrganizationMarketplaceListElement } from "~web/components/marketplace/marketplace-pag-list-element"

const selector = (state: OrganizationSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults
})

export default function MarketplacePage() {
    const { lastFetchedPage, setLastFetchedPage, view, setSearchTerm, searchResults } = useOrganizationSearchStore(useShallow(selector))

    useEffect(() => {
        // reset to trigger initial load using store's logic
        setSearchTerm("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 h-full mx-auto">
            <h1 className="text-xl semibold">Explore the Comend Marketplace</h1>
            
            <div>
                <h2>Patient Groups</h2>
                <ol className="w-full flex flex-col gap-4">
                    {searchResults?.map((organization, index) => (
                        <OrganizationMarketplaceListElement organization={organization} key={index}/>
                    ))}
                </ol>
            </div>
        </main>
    )
}
