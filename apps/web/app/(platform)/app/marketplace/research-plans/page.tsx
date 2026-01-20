"use client"

import React, { useEffect } from "react"
import { useShallow } from "zustand/react/shallow";
import { initializeResearchPlanSearch } from "@comend/lib/initialize-client-state";
import { ResearchPlanSearchState, useResearchPlanSearchStore } from "@/state/search/researchPlanSearchStore";
import { ResearchPlanMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/research-plans/research-plan-marketplace-integrated-search-and-filter";
import { ResearchPlanSearchResults } from "@comend/components/marketplace/research-plans/research-plan-search-results";

const selector = (state: ResearchPlanSearchState) => ({
    initialized: state.initialized
})

export default function ResearchPlanPage() {
    const {initialized} = useResearchPlanSearchStore(useShallow(selector))

    // initial fetch on mount
    useEffect(() => {
        if (!initialized) {
            const parsedResearchPlanFilters = {
            //     conditions: [],
            //     genes: [],
            //     openTo: [],
            //     status: [],
            //     organizations: []
            }
            initializeResearchPlanSearch(parsedResearchPlanFilters)
            console.log(`RFP search initialized...`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="flex flex-col w-full px-4 pb-20 items-center h-full">
            <div className="flex flex-col gap-4 p-2 w-full items-center align-center">
                <ResearchPlanMarketplaceIntegratedSearchAndFilter />
                <ResearchPlanSearchResults />
            </div>
        </main>
    )
}
