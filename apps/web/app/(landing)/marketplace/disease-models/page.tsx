"use client"

import React from "react"
import { DiseaseModelSearchResults } from "~web/components/marketplace/disease-models/disease-model-results";
import { DiseaseModelMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/disease-models/disease-model-marketplace-integrated-search-and-filter";

export default function DiseaseModelsPage() {
    return (
        <main className="flex flex-col w-full items-center h-full mx-auto">
            <div className="flex flex-col gap-4 p-2 w-full">
                <DiseaseModelMarketplaceIntegratedSearchAndFilter />
                <DiseaseModelSearchResults isInitialized={true}/>
            </div>
        </main>
    )
}
