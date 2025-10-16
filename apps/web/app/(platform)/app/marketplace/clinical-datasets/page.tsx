"use client"

import React, { useEffect, useState } from "react"
import { ClinicalDatasetSearchResults } from "~web/components/marketplace/clinical-datasets/clinical-dataset-results";
import { ClinicalDatasetMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/clinical-datasets/clinical-dataset-marketplace-integrated-search-and-filter";
import { SearchParams } from "@/packages/components/types";
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore";
import { useShallow } from "zustand/react/shallow";
import { initializeClinicalDatasetSearch } from "@/packages/lib/initialize-client-state";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: ClinicalDatasetSearchState) => ({
    initialized: state.initialized,
    filters: state.filters,
    setFilters: state.setFilters
})

export default function ClinicalDatasetsPage(props: IndexPageProps) {
    const {initialized, filters, setFilters} = useClinicalDatasetSearchStore(useShallow(selector))
    const [searchParams, setSearchParams] = useState({})
    const [isInitialized, setIsInitialized] = useState(false)
 
    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        const init = async () => {
            const searchParams = await props.searchParams;
            setSearchParams(searchParams)
            
            if (!initialized) {
                initializeClinicalDatasetSearch({
                    types: [] as any[],
                    genes: [] as any[],
                    conditions: [] as any[],
                    organizations: [] as any[]
                })
                console.log(`Clinical Dataset search initialized...`)
            }

            setIsInitialized(true)
        }

        init()
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <div className="flex flex-col gap-4 p-2 w-full">
                <ClinicalDatasetMarketplaceIntegratedSearchAndFilter />
                <ClinicalDatasetSearchResults searchParams={searchParams} isInitialized={isInitialized}/>
            </div>
        </main>
    )
}
