"use client"

import { Skeleton } from "@/packages/components/ui/skeleton"
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"
import { OrganizationMarketplaceListElement } from "~web/components/marketplace/marketplace-pag-list-element"

const selector = (state: OrganizationSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

export default function MarketplacePage() {
    const { lastFetchedPage, setLastFetchedPage, view, setSearchTerm, searchResults } = useOrganizationSearchStore(useShallow(selector))

    useEffect(() => {
        // reset to trigger initial load using store's logic
        // setResultsPerPage(3);
        setSearchTerm("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 h-full mx-auto">
            <h1 className="text-xl semibold">Explore the Comend Marketplace</h1>
            
            <div className="flex flex-col gap-2">
                <h2>Patient Groups</h2>
                <ol className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {(searchResults && searchResults.length > 0 )
                        ? (
                            <>
                                {searchResults?.slice(0, 3).map((organization, index) => (
                                    <OrganizationMarketplaceListElement organization={organization} key={index}/>
                                ))}
                            </>
                        )
                        : (
                            <>
                                <Skeleton className="h-[286px] w-full"/>
                                <Skeleton className="h-[286px] w-full"/>
                                <Skeleton className="h-[286px] w-full"/>
                            </>
                        )
                    }
                </ol>
                <a href="/marketplace/patient-groups" className="justify-self-end self-end">See all patient groups...</a>
            </div>
        </main>
    )
}
