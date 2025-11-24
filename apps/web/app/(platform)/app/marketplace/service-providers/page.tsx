"use client"

import React, { useEffect } from "react"
import {CROSearchResults} from "@comend/components/marketplace/service-providers/cro-search-results";
import {ProviderMarketplaceIntegratedSearchAndFilter} from "@comend/components/marketplace/service-providers/provider-marketplace-integrated-search-and-filter";
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore";
import { useShallow } from "zustand/react/shallow";
import { initializeCROSearch } from "@comend/lib/initialize-client-state";

const selector = (state: CROSearchState) => ({
    initialized: state.initialized
})

export default function CROPage() {
    const {initialized} = useCROSearchStore(useShallow(selector))

    // initial fetch on mount
    useEffect(() => {
        if (!initialized) {
            const parsedCROFilters = {
                categories: [] as any[],
                milestoneTypes: [] as any[],
                types: [] as any[],
                certifications: [] as any[],
                tags: [] as any[],
            }
            initializeCROSearch(parsedCROFilters)
            console.log(`CRO search initialized...`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="flex flex-col w-full px-4 pb-20 items-center h-full">
            <div className="flex flex-col gap-4 p-2 w-full items-center align-center">
                <ProviderMarketplaceIntegratedSearchAndFilter />
                <CROSearchResults />
            </div>
        </main>
    )
}
