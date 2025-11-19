"use client"

import React from "react"
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore"
import { useShallow } from "zustand/react/shallow";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import { TypesenseBiosamplesTable } from "@comend/components/biorepo/advanced-data-table/biosamples-table/typesense-biosamples-table";
import { useBiosamplesTableColumns } from "@comend/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns";

const selector = (state: BiosampleSearchState) => ({
    searchResults: state.searchResults,
    setSortBy: state.setSortBy
})

export function BiosampleSearchResults({
    // searchParams,
    isInitialized
}: {
    // searchParams?: SearchParams | undefined,
    isInitialized: boolean
}) {
    const { 
        searchResults,
        // setSortBy
    } = useBiosampleSearchStore(useShallow(selector))
    const columns = useBiosamplesTableColumns() // by default sorting & hiding are enabled

    // useEffect(() => {
    //     setSortBy(searchParams?.sort)
    // }, [searchParams?.sort])

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
                    <TypesenseBiosamplesTable data={searchResults} pageCount={1} columns={columns} searchParams={{}}/>
                </div>
            )}
        </div>
    )
}
