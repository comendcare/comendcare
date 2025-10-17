"use client"

import React from "react"
import { useShallow } from "zustand/react/shallow";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import { useClinicalDatasetsTableColumns } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns";
import { ClinicalDatasetsTable } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table";
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore";

const selector = (state: ClinicalDatasetSearchState) => ({
    searchResults: state.searchResults,
})

export function ClinicalDatasetSearchResults({
    isInitialized
}: {
    isInitialized: boolean
}) {
    const { 
        searchResults,
    } = useClinicalDatasetSearchStore(useShallow(selector))
    const columns = useClinicalDatasetsTableColumns()

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
                    <ClinicalDatasetsTable data={searchResults} pageCount={1} columns={columns} searchParams={{}}/>
                </div>
            )}
        </div>
    )
}
