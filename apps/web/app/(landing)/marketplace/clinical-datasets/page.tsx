"use client"

import React from "react"
import { ClinicalDatasetSearchResults } from "~web/components/marketplace/clinical-datasets/clinical-dataset-results";
import { ClinicalDatasetMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/clinical-datasets/clinical-dataset-marketplace-integrated-search-and-filter";

export default function ClinicalDatasetsPage() {
    return (
        <main className="flex flex-col w-full items-center h-full mx-auto">
            <div className="flex flex-col gap-4 p-2 w-full">
                <ClinicalDatasetMarketplaceIntegratedSearchAndFilter />
                <ClinicalDatasetSearchResults />
            </div>
        </main>
    )
}
