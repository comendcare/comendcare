"use client"

import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area";
import CROSearchBar from "@/components/cro-searchbar";
import {CROSearchResults} from "@/components/cro-search-results";

export default function CROPage() {
    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <ScrollArea className="px-8 w-full">
                <div className="flex flex-col gap-4 p-2 w-full">
                    <CROSearchBar />
                    <CROSearchResults />
                </div>
            </ScrollArea>
        </main>
    )
}
