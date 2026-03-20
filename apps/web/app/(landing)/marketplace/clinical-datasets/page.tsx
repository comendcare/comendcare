"use client"

import React, { useEffect, useState } from "react"
import { ClinicalDatasetSearchResults } from "@comend/components/marketplace/clinical-datasets/clinical-dataset-results";
import { ClinicalDatasetMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/clinical-datasets/clinical-dataset-marketplace-integrated-search-and-filter";
import { SearchParams } from "@comend/components/types";
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore";
import { useShallow } from "zustand/react/shallow";
import { initializeClinicalDatasetSearch } from "@comend/lib/initialize-client-state";
import { TOOL_TYPE_OPTIONS } from "@comend/lib/types";
import { Organization } from "@prisma/client";
import type { Option } from "@comend/lib/types";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: ClinicalDatasetSearchState) => ({
    initialized: state.initialized,
    setSortBy: state.setSortBy
})

export default function ClinicalDatasetsPage(props: IndexPageProps) {
    const {initialized, setSortBy} = useClinicalDatasetSearchStore(useShallow(selector))
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
                initializeClinicalDatasetSearch(
                    {
                        types: ((filters?.types || [])
                            .map((value: string) => TOOL_TYPE_OPTIONS.find(option => option.value === value))
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
