import React from "react"
import { DiseaseModelSearchResults } from "~web/components/marketplace/disease-models/disease-model-results";
import { DiseaseModelMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/disease-models/disease-model-marketplace-integrated-search-and-filter";
import { SearchParams } from "@/packages/components/types";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

export default async function DiseaseModelsPage(props: IndexPageProps) {
    const searchParams = await props.searchParams;

    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <div className="flex flex-col gap-4 p-2 w-full">
                <DiseaseModelMarketplaceIntegratedSearchAndFilter />
                <DiseaseModelSearchResults searchParams={searchParams}/>
            </div>
        </main>
    )
}
