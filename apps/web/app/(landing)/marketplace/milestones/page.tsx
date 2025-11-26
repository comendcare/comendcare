import React from "react"
import { ScrollArea } from "@comend/components/ui/scroll-area";
import { MilestoneSearchResults } from "~web/components/milestone-search-results";
import MilestoneSearchBar from "~web/components/milestone-searchbar";
import { redirect } from "next/navigation";

export default async function MilestonesPage() {
    redirect("/marketplace") // temporary redirect
    
    return (
        <main className="flex flex-col w-full items-center h-full mx-auto">
            <ScrollArea className="px-8 w-full">
                <div className="flex flex-col gap-4 p-2 w-full">
                    <MilestoneSearchBar />
                    <MilestoneSearchResults />
                </div>
            </ScrollArea>
        </main>
    )
}
