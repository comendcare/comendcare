"use client"

import React, { useEffect, useState } from "react"
import { DiseaseModelSearchResults } from "@comend/components/marketplace/disease-models/disease-model-results";
import { DiseaseModelMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/disease-models/disease-model-marketplace-integrated-search-and-filter";
import { initializeDiseaseModelSearch } from "@comend/lib/initialize-client-state";
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore";
import { SearchParams } from "@comend/components/types";
import { useShallow } from "zustand/react/shallow";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: DiseaseModelSearchState) => ({
    initialized: state.initialized,
    setSortBy: state.setSortBy
})

export default function DiseaseModelsPage(props: IndexPageProps) {
    const {initialized, setSortBy} = useDiseaseModelSearchStore(useShallow(selector))
    const [isInitialized, setIsInitialized] = useState(false)

    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        const init = async () => {
            const searchParams = await props.searchParams;
            
            if (!initialized) {
                initializeDiseaseModelSearch(
                    {
                        types: [] as any[],
                        genes: [] as any[],
                        conditions: [] as any[],
                        organizations: [] as any[],
                    },
                    searchParams?.sort
                )
                console.log(`Disease Model search initialized...`)
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
                <DiseaseModelMarketplaceIntegratedSearchAndFilter />
                <DiseaseModelSearchResults isInitialized={isInitialized}/>
            </div>
        </main>
    )
}
