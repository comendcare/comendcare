"use client"

import React, { useEffect } from "react"
import { useShallow } from "zustand/react/shallow";
import { initializeRFPSearch } from "@/packages/lib/initialize-client-state";
import { RFPSearchState, useRFPSearchStore } from "@/state/search/rfpSearchStore";
import { RFPMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/rfps/rfp-marketplace-integrated-search-and-filter";
import { RFPSearchResults } from "~web/components/marketplace/rfps/rfp-search-results";

const selector = (state: RFPSearchState) => ({
    initialized: state.initialized
})

export default function RFPPage() {
    const {initialized} = useRFPSearchStore(useShallow(selector))

    // initial fetch on mount
    useEffect(() => {
        if (!initialized) {
            const parsedRFPFilters = {
                // categories: [] as any[],
                // milestoneTypes: [] as any[],
                // types: [] as any[],
                // certifications: [] as any[],
                // tags: [] as any[],
            }
            initializeRFPSearch(parsedRFPFilters)
            console.log(`RFP search initialized...`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="flex flex-col w-full px-4 pb-20 items-center h-full">
            <div className="flex flex-col gap-4 p-2 w-full">
                <RFPMarketplaceIntegratedSearchAndFilter />
                <RFPSearchResults />
            </div>
        </main>
    )
}