"use client"

import React, { useEffect, useState } from "react"
import { BiosampleSearchResults } from "@comend/components/marketplace/biosamples/biosample-results";
import { BiosampleMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/biosamples/biosample-marketplace-integrated-search-and-filter";
import { SearchParams } from "@comend/components/types";
import { initializeBiosampleSearch } from "@comend/lib/initialize-client-state";
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore";
import { useShallow } from "zustand/react/shallow";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: BiosampleSearchState) => ({
    initialized: state.initialized,
    setSortBy: state.setSortBy
})

export default function BiosamplesPage(props: IndexPageProps) {
    const {initialized, setSortBy} = useBiosampleSearchStore(useShallow(selector))
    const [isInitialized, setIsInitialized] = useState(false)
 
    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        const init = async () => {
            const searchParams = await props.searchParams;
            
            if (!initialized) {
                await initializeBiosampleSearch(
                    {
                        types: [] as any[],
                        genes: [] as any[],
                        conditions: [] as any[],
                        organizations: [] as any[],
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
                <BiosampleMarketplaceIntegratedSearchAndFilter />
                <BiosampleSearchResults isInitialized={isInitialized}/>
            </div>
        </main>
    )
}
