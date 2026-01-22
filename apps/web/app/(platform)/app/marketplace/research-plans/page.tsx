"use client"

import React, { useEffect, useState } from "react"
import { useShallow } from "zustand/react/shallow";
import { initializeResearchPlanSearch } from "@comend/lib/initialize-client-state";
import { ResearchPlanSearchState, useResearchPlanSearchStore } from "@/state/search/researchPlanSearchStore";
import { ResearchPlanMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/research-plans/research-plan-marketplace-integrated-search-and-filter";
import { ResearchPlanSearchResults } from "@comend/components/marketplace/research-plans/research-plan-search-results";
import { SearchParams } from "@comend/components/types";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: ResearchPlanSearchState) => ({
    initialized: state.initialized,
    setSortBy: state.setSortBy
})

export default function ResearchPlanPage(props: IndexPageProps) {
    const {initialized, setSortBy} = useResearchPlanSearchStore(useShallow(selector))
    const [isInitialized, setIsInitialized] = useState(false)
 
    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        const init = async () => {
            const searchParams = await props.searchParams;
            
            if (!initialized) {
                await initializeResearchPlanSearch(
                    {
                        stages: [] as any[],
                        statuses: [] as any[],
                        modalities: [] as any[],
                    },
                    searchParams?.sort
                )
                console.log(`Biosample search initialized...`)
            }

            setIsInitialized(true)
        }

        init()
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const updateSearchParams = async () => {
            const searchParams = await props.searchParams
            setSortBy(searchParams?.sort)
        }

        updateSearchParams()
    }, [props])

    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <div className="flex flex-col gap-4 p-2 w-full">
                <ResearchPlanMarketplaceIntegratedSearchAndFilter />
                <ResearchPlanSearchResults isInitialized={isInitialized}/>
            </div>
        </main>
    )
}
