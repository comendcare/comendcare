"use client"

import React from "react"
import { BiosampleSearchResults } from "~web/components/marketplace/biosamples/biosample-results";
import { BiosampleMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/biosamples/biosample-marketplace-integrated-search-and-filter";

export default function BiosamplesPage() {
    return (
        <main className="flex flex-col w-full items-center h-full mx-auto">
            <div className="flex flex-col gap-4 p-2 w-full">
                <BiosampleMarketplaceIntegratedSearchAndFilter />
                <BiosampleSearchResults isInitialized={true}/>
            </div>
        </main>
    )
}
