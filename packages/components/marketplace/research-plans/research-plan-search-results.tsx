"use client"

import React from "react"
import { useShallow } from "zustand/react/shallow";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import { ResearchPlanSearchState, useResearchPlanSearchStore } from "@/state/search/researchPlanSearchStore";
import { TypesenseResearchPlansTable } from "@comend/components/biorepo/advanced-data-table/research-plans-table/typesense-research-plans-table";
import { useResearchPlansTableColumns } from "@comend/components/biorepo/advanced-data-table/research-plans-table/public-research-plans-table-columns";

const selector = (state: ResearchPlanSearchState) => ({
    view: state.view,
    searchResults: state.searchResults,
    totalResults: state.totalResults
})

export function ResearchPlanSearchResults({
    isInitialized
}: {
    isInitialized: boolean
}) {
    const { searchResults } = useResearchPlanSearchStore(useShallow(selector))
    const columns = useResearchPlansTableColumns(
        false,
        false,
        false,
        'default'
    )

    if (!isInitialized || !searchResults) {
        return (
            <div className="h-full w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
                <Skeleton className="h-[286px] w-full"/>
            </div>
        )
    }

    return (
        <div className="w-full max-w-full flex flex-col gap-4">
            {(!searchResults || searchResults.length === 0) ? (
                <NoResultsView />
            ): (
                <div className="max-w-7xl w-full overflow-auto">
                    <TypesenseResearchPlansTable 
                        data={searchResults} 
                        pageCount={1} 
                        columns={columns} 
                        searchParams={{}}
                    />
                </div>
            )}
        </div>
    )
}
