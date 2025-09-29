import React from "react"
import { ClinicalDatasetSearchResults } from "~web/components/marketplace/clinical-datasets/clinical-dataset-results";
import { ClinicalDatasetMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/clinical-datasets/clinical-dataset-marketplace-integrated-search-and-filter";
import { SearchParams } from "@/packages/components/types";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

export default async function ClinicalDatasetsPage(props: IndexPageProps) {
    const searchParams = await props.searchParams;

    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <div className="flex flex-col gap-4 p-2 w-full">
                <ClinicalDatasetMarketplaceIntegratedSearchAndFilter />
                <ClinicalDatasetSearchResults searchParams={searchParams}/>
            </div>
        </main>
    )
}
