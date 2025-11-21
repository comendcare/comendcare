"use client"

import React, { useEffect } from "react"
import { useShallow } from "zustand/react/shallow";
import { initializeResearcherSearch } from "@comend/lib/initialize-client-state";
import { ResearcherSearchState, useResearcherSearchStore } from "@/state/search/researcherSearchStore";
import { ResearcherMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/researchers/researcher-marketplace-integrated-search-and-filter";
import { ResearcherSearchResults } from "@comend/components/marketplace/researchers/researcher-search-results";

const selector = (state: ResearcherSearchState) => ({
    initialized: state.initialized
})

export default function ResearcherPage() {
    const {initialized} = useResearcherSearchStore(useShallow(selector))

    // initial fetch on mount
    useEffect(() => {
        if (!initialized) {
            const parsedResearcherFilters = {
                // conditions: [],
                researchInterests: [],
                genes: [],
                // openTo: [],
                // status: [],
                // organizations: []
            }
            initializeResearcherSearch(parsedResearcherFilters)
            console.log(`Researcher search initialized...`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="flex flex-col w-full px-4 pb-20 items-center h-full">
            <div className="flex flex-col gap-4 p-2 w-full items-center align-center">
                <ResearcherMarketplaceIntegratedSearchAndFilter />
                <ResearcherSearchResults />
            </div>
        </main>
    )
}
