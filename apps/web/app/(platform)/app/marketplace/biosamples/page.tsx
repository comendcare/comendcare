"use client"

import React, { useEffect, useState } from "react"
import { BiosampleSearchResults } from "~web/components/marketplace/biosamples/biosample-results";
import { BiosampleMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/biosamples/biosample-marketplace-integrated-search-and-filter";
import { SearchParams } from "@/packages/components/types";
import { initializeBiosampleSearch } from "@/packages/lib/initialize-client-state";
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore";
import { useShallow } from "zustand/react/shallow";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: BiosampleSearchState) => ({
    initialized: state.initialized,
    filters: state.filters,
    setFilters: state.setFilters
})

export default function BiosamplesPage(props: IndexPageProps) {
    const {initialized, filters, setFilters} = useBiosampleSearchStore(useShallow(selector))
    const [searchParams, setSearchParams] = useState({})
    const [isInitialized, setIsInitialized] = useState(false)
 
    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        const init = async () => {
            const searchParams = await props.searchParams;
            setSearchParams(searchParams)
            
            if (!initialized) {
                await initializeBiosampleSearch({
                    types: [] as any[],
                    genes: [] as any[],
                    conditions: [] as any[],
                    organizations: [] as any[],
                })
                console.log(`Biosample search initialized...`)
            }

            setIsInitialized(true)
        }

        init()
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <div className="flex flex-col gap-4 p-2 w-full">
                <BiosampleMarketplaceIntegratedSearchAndFilter />
                <BiosampleSearchResults searchParams={searchParams} isInitialized={isInitialized}/>
            </div>
        </main>
    )
}
