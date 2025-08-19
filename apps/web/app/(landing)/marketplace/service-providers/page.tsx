"use client"

import React from "react"
import { ScrollArea } from "@comend/components/ui/scroll-area";
import {CROSearchResults} from "~web/components/marketplace/service-providers/cro-search-results";
import CROSearchBar from "~web/components/marketplace/service-providers/cro-searchbar";
import {ProviderMarketplaceIntegratedSearchAndFilter} from "~web/components/marketplace/service-providers/provider-marketplace-integrated-search-and-filter";

export default function CROPage() {
    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <ScrollArea className="px-8 w-full">
                <div className="flex flex-col gap-4 p-2 w-full">
                    <ProviderMarketplaceIntegratedSearchAndFilter />
                    <CROSearchResults />
                </div>
            </ScrollArea>
        </main>
    )
}
