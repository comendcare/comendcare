// "use client"

import React, { useEffect, useState } from "react"
import { ClinicalDatasetSearchResults } from "@comend/components/marketplace/clinical-datasets/clinical-dataset-results";
import { ClinicalDatasetMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/clinical-datasets/clinical-dataset-marketplace-integrated-search-and-filter";
import { SearchParams } from "@comend/components/types";
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore";
import { useShallow } from "zustand/react/shallow";
import { initializeClinicalDatasetSearch } from "@comend/lib/initialize-client-state";
import { biosampleSearchParamsCache } from "@comend/lib/validations";
import { getValidFilters } from "@comend/lib/data-table";
import { useClinicalDatasetsTableColumns } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns";
import { getClinicalDatasets } from "@comend/lib/fetchers";
import { ClinicalDatasetMarketplacePage } from "@comend/components/marketplace/clinical-datasets/clinical-dataset-tools-page"

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: ClinicalDatasetSearchState) => ({
    initialized: state.initialized,
    setSortBy: state.setSortBy
})

export default async function ClinicalDatasetsPage(props: IndexPageProps) {
    // const {initialized, setSortBy} = useClinicalDatasetSearchStore(useShallow(selector))
    // const [isInitialized, setIsInitialized] = useState(false)
 
    // // initial fetch on mount - initialize automatically calls first typesense search
    // useEffect(() => {
    //     const init = async () => {
    //         const searchParams = await props.searchParams;
            
    //         if (!initialized) {
    //             initializeClinicalDatasetSearch(
    //                 {
    //                     types: [] as any[],
    //                     genes: [] as any[],
    //                     conditions: [] as any[],
    //                     organizations: [] as any[]
    //                 },
    //                 searchParams?.sort
    //             )
    //             console.log(`Clinical Dataset search initialized...`)
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
    //             <ClinicalDatasetMarketplaceIntegratedSearchAndFilter />
    //             <ClinicalDatasetSearchResults isInitialized={isInitialized}/>
    //         </div>
    //     </main>
    // )

    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const columns = useClinicalDatasetsTableColumns(true, true, false)

    const {data, pageCount} = await getClinicalDatasets(
        undefined,
        {
            id: true,
            createdAt: true,
            updatedAt: true,

            title: true,
            cohortSize: true,
            description: true,
            contacts: true,
            attachments: true,
            private: true,
            // pinned: true,
            // metadata: true,
            types: true,
            notes: true,

            institutionId: true,
            institution: true,
            company: true,
            geneId: true,
            gene: true,
            genes: true,
            organizationId: true,
            organization: {include: {conditions: {include: {condition: true}}}},
            milestones: {include: {milestone: true}},
        },
        {...search, q: globalFilter, filters: validFilters},
        true, // public only
        columns
    )

    return (
        <ClinicalDatasetMarketplacePage 
            data={[...data]} 
            pageCount={pageCount} 
            searchParams={searchParams} 
        />
    )
}
