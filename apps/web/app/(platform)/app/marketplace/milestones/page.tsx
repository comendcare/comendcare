import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area";
import { MilestoneSearchResults } from "@/components/milestone-search-results";
import MilestoneSearchBar from "@/components/milestone-searchbar";

export default async function MilestonesPage() {
    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <ScrollArea className="px-8 w-full">
                <div className="flex flex-col gap-4 p-2 w-full">
                    <MilestoneSearchBar />
                    <MilestoneSearchResults />
                </div>
            </ScrollArea>
        </main>
    )
}
