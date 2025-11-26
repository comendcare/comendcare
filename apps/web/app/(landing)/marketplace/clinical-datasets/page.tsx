"use client"

import React, { useEffect, useState } from "react"
import { ClinicalDatasetSearchResults } from "@comend/components/marketplace/clinical-datasets/clinical-dataset-results";
import { ClinicalDatasetMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/clinical-datasets/clinical-dataset-marketplace-integrated-search-and-filter";
import { SearchParams } from "@comend/components/types";
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore";
import { useShallow } from "zustand/react/shallow";
import { initializeClinicalDatasetSearch } from "@comend/lib/initialize-client-state";
import { redirect } from "next/navigation";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: ClinicalDatasetSearchState) => ({
    initialized: state.initialized,
    setSortBy: state.setSortBy
})

export default function ClinicalDatasetsPage(props: IndexPageProps) {
    redirect("/marketplace") // temporary redirect
    
    const {initialized, setSortBy} = useClinicalDatasetSearchStore(useShallow(selector))
    const [isInitialized, setIsInitialized] = useState(false)
 
    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        const init = async () => {
            const searchParams = await props.searchParams;
            
            if (!initialized) {
                initializeClinicalDatasetSearch(
                    {
                        types: [] as any[],
                        genes: [] as any[],
                        conditions: [] as any[],
                        organizations: [] as any[]
                    },
                    searchParams?.sort
                )
                console.log(`Clinical Dataset search initialized...`)
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
                <ClinicalDatasetMarketplaceIntegratedSearchAndFilter />
                <ClinicalDatasetSearchResults isInitialized={isInitialized}/>
            </div>
        </main>
    )
}
