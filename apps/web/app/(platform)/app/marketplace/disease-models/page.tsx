"use client"

import React, { useEffect, useState } from "react"
import { DiseaseModelSearchResults } from "~web/components/marketplace/disease-models/disease-model-results";
import { DiseaseModelMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/disease-models/disease-model-marketplace-integrated-search-and-filter";
import { SearchParams } from "@/packages/components/types";
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore";
import { useShallow } from "zustand/react/shallow";
import { initializeDiseaseModelSearch } from "@/packages/lib/initialize-client-state";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: DiseaseModelSearchState) => ({
    initialized: state.initialized,
    filters: state.filters,
    setFilters: state.setFilters
})

export default function DiseaseModelsPage(props: IndexPageProps) {
    const {initialized, filters, setFilters} = useDiseaseModelSearchStore(useShallow(selector))
    const [searchParams, setSearchParams] = useState({})
    const [isInitialized, setIsInitialized] = useState(false)

    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        const init = async () => {
            const searchParams = await props.searchParams;
            setSearchParams(searchParams)
            
            if (!initialized) {
                initializeDiseaseModelSearch({
                    types: [] as any[],
                    genes: [] as any[],
                    conditions: [] as any[],
                    organizations: [] as any[],
                })
                console.log(`Disease Model search initialized...`)
            }

            setIsInitialized(true)
        }

        init()
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <div className="flex flex-col gap-4 p-2 w-full">
                <DiseaseModelMarketplaceIntegratedSearchAndFilter />
                <DiseaseModelSearchResults searchParams={searchParams} isInitialized={isInitialized}/>
            </div>
        </main>
    )
}
