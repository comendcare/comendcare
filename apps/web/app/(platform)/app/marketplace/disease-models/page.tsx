// "use client"

import React, { useEffect, useState } from "react"
import { DiseaseModelSearchResults } from "@comend/components/marketplace/disease-models/disease-model-results";
import { DiseaseModelMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/disease-models/disease-model-marketplace-integrated-search-and-filter";
import { SearchParams } from "@comend/components/types";
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore";
import { useShallow } from "zustand/react/shallow";
import { initializeDiseaseModelSearch } from "@comend/lib/initialize-client-state";
import { biosampleSearchParamsCache } from "@comend/lib/validations";
import { getValidFilters } from "@comend/lib/data-table";
import { useDiseaseModelsTableColumns } from "@comend/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns";
import { getDiseaseModels } from "@comend/lib/fetchers";
import { DiseaseModelMarketplacePage } from "@comend/components/marketplace/disease-models/disease-model-tools-page"

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: DiseaseModelSearchState) => ({
    initialized: state.initialized,
    setSortBy: state.setSortBy
})

export default async function DiseaseModelsPage(props: IndexPageProps) {
    // const {initialized, setSortBy} = useDiseaseModelSearchStore(useShallow(selector))
    // const [isInitialized, setIsInitialized] = useState(false)

    // // initial fetch on mount - initialize automatically calls first typesense search
    // useEffect(() => {
    //     const init = async () => {
    //         const searchParams = await props.searchParams;
            
    //         if (!initialized) {
    //             initializeDiseaseModelSearch(
    //                 {
    //                     types: [] as any[],
    //                     genes: [] as any[],
    //                     conditions: [] as any[],
    //                     organizations: [] as any[],
    //                 },
    //                 searchParams?.sort
    //             )
    //             console.log(`Disease Model search initialized...`)
    //         }

    //         setIsInitialized(true)
    //     }

    //     init()
        
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    // useEffect(() => {
    //     const updateSearchParams = async () => {
    //         const searchParams = await props.searchParams
    //         setSortBy(searchParams?.sort)
    //     }

    //     updateSearchParams()
    // }, [props])

    // return (
    //     <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
    //         <div className="flex flex-col gap-4 p-2 w-full">
    //             <DiseaseModelMarketplaceIntegratedSearchAndFilter />
    //             <DiseaseModelSearchResults isInitialized={isInitialized}/>
    //         </div>
    //     </main>
    // )

    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const columns = useDiseaseModelsTableColumns(true, true, false)

    const {data, pageCount} = await getDiseaseModels(
        undefined,
        {
            id: true,
            createdAt: true,
            updatedAt: true,
            description: true,
            contacts: true,
            attachments: true,
            private: true,
            types: true,
            genotype: true,
            strain: true,
            notes: true,
            institutionId: true,
            institution: true,
            company: true,
            geneId: true,
            gene: true,
            genes: true,
            conditionId: true,
            condition: true,
            organizationId: true,
            organization: {include: {conditions: {include: {condition: true}}}},
            milestones: {include: {milestone: true}},
        },
        {...search, q: globalFilter, filters: validFilters},
        true, // public only
        columns
    )

    return (
        <DiseaseModelMarketplacePage 
            data={[...data]} 
            pageCount={pageCount} 
            searchParams={searchParams} 
        />
    )
}
