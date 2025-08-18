"use client"

import React from "react"
import { ScrollArea } from "@comend/components/ui/scroll-area";
import { BiosampleSearchResults } from "~web/components/marketplace/biosamples/biosample-results";
import { BiosampleMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/biosamples/biosample-marketplace-integrated-search-and-filter";

export default function BiosamplesPage() {
    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            {/* <ScrollArea className="px-8 w-full"> */}
                <div className="flex flex-col gap-4 p-2 w-full">
                    <BiosampleMarketplaceIntegratedSearchAndFilter />
                    <BiosampleSearchResults />
                </div>
            {/* </ScrollArea> */}
        </main>
    )
}
