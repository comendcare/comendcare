"use client"

import React from "react"
import { ScrollArea } from "@comend/components/ui/scroll-area";
import { DiseaseModelSearchResults } from "~web/components/marketplace/disease-models/disease-model-results";
import { DiseaseModelMarketplaceIntegratedSearchAndFilter } from "~web/components/marketplace/disease-models/disease-model-marketplace-integrated-search-and-filter";

export default function DiseaseModelsPage() {
    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <ScrollArea className="px-8 w-full">
                <div className="flex flex-col gap-4 p-2 w-full">
                    <DiseaseModelMarketplaceIntegratedSearchAndFilter />
                    <DiseaseModelSearchResults />
                </div>
            </ScrollArea>
        </main>
    )
}
