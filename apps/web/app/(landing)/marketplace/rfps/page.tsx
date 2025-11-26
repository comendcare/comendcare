"use client"

import React, { useEffect } from "react"
import { useShallow } from "zustand/react/shallow";
import { initializeRFPSearch } from "@comend/lib/initialize-client-state";
import { RFPSearchState, useRFPSearchStore } from "@/state/search/rfpSearchStore";
import { RFPMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/rfps/rfp-marketplace-integrated-search-and-filter";
import { RFPSearchResults } from "@comend/components/marketplace/rfps/rfp-search-results";
import { redirect } from "next/navigation";

const selector = (state: RFPSearchState) => ({
    initialized: state.initialized
})

export default function RFPPage() {
    redirect("/marketplace") // temporary redirect

    const {initialized} = useRFPSearchStore(useShallow(selector))

    // initial fetch on mount
    useEffect(() => {
        if (!initialized) {
            const parsedRFPFilters = {
                conditions: [],
                genes: [],
                openTo: [],
                status: [],
                organizations: []
            }
            initializeRFPSearch(parsedRFPFilters)
            console.log(`RFP search initialized...`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="flex flex-col w-full px-4 pb-20 items-center h-full">
            <div className="flex flex-col gap-4 p-2 w-full items-center align-center">
                <RFPMarketplaceIntegratedSearchAndFilter />
                <RFPSearchResults />
            </div>
        </main>
    )
}