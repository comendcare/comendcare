"use client"

import React, { useEffect, useState } from "react"
import { BiosampleSearchResults } from "@comend/components/marketplace/biosamples/biosample-results";
import { BiosampleMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/biosamples/biosample-marketplace-integrated-search-and-filter";
import { SearchParams } from "@comend/components/types";
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore";
import { useShallow } from "zustand/react/shallow";
import { initializeBiosampleSearch } from "@comend/lib/initialize-client-state";
import { Organization } from "@prisma/client";
import type { Option } from "@comend/lib/types";
import { BIOSAMPLE_TYPE_OPTIONS } from "@comend/lib/types";

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
            const filters = searchParams?.filters !== undefined ? JSON.parse(searchParams.filters as string) : undefined

            let filterOrgs: Organization[] = []
            if (filters && filters?.organizations) {
                const prismaResponse = await fetch('/api/organizations', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ids: filters.organizations as any[]}),
                })
                filterOrgs = await prismaResponse.json()
            }
            
            if (!initialized) {
                await initializeBiosampleSearch(
                    {
                        types: ((filters?.types || [])
                            .map((value: string) => BIOSAMPLE_TYPE_OPTIONS.find(option => option.value === value))
                            .filter((option: Option | undefined) => !!option)) as any[],
                        genes: ((filters?.genes || []).map((symbol: string) => ({
                                label: symbol,
                                value: symbol,
                            }))) as any[],
                        conditions: ((filters?.conditions || []).map((condition: string) => ({
                                label: condition,
                                value: condition,
                            }))) as any[],
                        organizations: ((filterOrgs || []).map((org) => ({
                                label: org.name,
                                value: org.id,
                            }))) as any[],
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
        <main className="flex flex-col w-full items-center h-full mx-auto">
            <div className="flex flex-col gap-4 p-2 w-full">
                <BiosampleMarketplaceIntegratedSearchAndFilter />
                <BiosampleSearchResults isInitialized={isInitialized}/>
            </div>
        </main>
    )
}
