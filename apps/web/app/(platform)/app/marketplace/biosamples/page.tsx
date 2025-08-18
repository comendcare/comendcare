"use client"

import React from "react"
import { ScrollArea } from "@comend/components/ui/scroll-area";
import BiosampleSearchBar from "~web/components/marketplace/biosamples/biosample-searchbar";
import { BiosampleSearchResults } from "~web/components/marketplace/biosamples/biosample-results";

export default function BiosamplesPage() {
    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <ScrollArea className="px-8 w-full">
                <div className="flex flex-col gap-4 p-2 w-full">
                    {/* <BiosampleSearchBar /> */}
                    <BiosampleSearchResults />
                </div>
            </ScrollArea>
        </main>
    )
}
