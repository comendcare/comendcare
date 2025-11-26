// "use client"

import React, { useEffect, useState } from "react"
import { BiosampleSearchResults } from "@comend/components/marketplace/biosamples/biosample-results";
import { BiosampleMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/biosamples/biosample-marketplace-integrated-search-and-filter";
import { SearchParams } from "@comend/components/types";
import { initializeBiosampleSearch } from "@comend/lib/initialize-client-state";
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore";
import { useShallow } from "zustand/react/shallow";
import { biosampleSearchParamsCache } from "@comend/lib/validations";
import { getValidFilters } from "@comend/lib/data-table";
import { useBiosamplesTableColumns } from "@comend/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns";
import { getBiosamples } from "@comend/lib/fetchers";
import { BiosampleMarketplacePage } from "@comend/components/marketplace/biosamples/biosample-tools-page"

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: BiosampleSearchState) => ({
    initialized: state.initialized,
    setSortBy: state.setSortBy
})

export default async function BiosamplesPage(props: IndexPageProps) {
    // const {initialized, setSortBy} = useBiosampleSearchStore(useShallow(selector))
    // const [isInitialized, setIsInitialized] = useState(false)
 
    // // initial fetch on mount - initialize automatically calls first typesense search
    // useEffect(() => {
    //     const init = async () => {
    //         const searchParams = await props.searchParams;
            
    //         if (!initialized) {
    //             await initializeBiosampleSearch(
    //                 {
    //                     types: [] as any[],
    //                     genes: [] as any[],
    //                     conditions: [] as any[],
    //                     organizations: [] as any[],
    //                 },
    //                 searchParams?.sort
    //             )
    //             console.log(`Biosample search initialized...`)
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
    //             <BiosampleMarketplaceIntegratedSearchAndFilter />
    //             <BiosampleSearchResults isInitialized={isInitialized}/>
    //         </div>
    //     </main>
    // )

    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const columns = useBiosamplesTableColumns(true, true, false)

    const {data, pageCount} = await getBiosamples(
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
            variant: true,
            availability: true,
            quantity: true,
            quantityUnit: true,
            currentCountry: true,
            countryOfCollection: true,
            preservationMethod: true,
            anatomicalSite: true,
            methodOfTransport: true,
            collectionDate: true,
            ageAtCollection: true,
            price: true,
            priceUnit: true,
            notes: true,

            milestones: {include: {milestone: true}},
            donorId: true,
            donor: {
                include: {
                    diagnoses: {
                        include: {type: true}
                    }
                }
            },
            institutionId: true,
            institution: true,
            company: true,
            geneId: true,
            gene: true,
            genes: true,
            organizationId: true,
            organization: {include: {conditions: {include: {condition: true}}}},
            materialAndDataAccessRequests: true
        },
        {...search, q: globalFilter, filters: validFilters},
        true, // public only
        columns,
    )

    return (
        <BiosampleMarketplacePage 
            data={[...data]} 
            pageCount={pageCount} 
            searchParams={searchParams} 
        />
    )
}
