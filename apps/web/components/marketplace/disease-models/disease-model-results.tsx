"use client"

import React from "react"
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore"
import { useShallow } from "zustand/react/shallow";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import { useDiseaseModelsTableColumns } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns";
import { DiseaseModelsTable } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table";
import { SearchParams } from "@/packages/components/types";

const selector = (state: DiseaseModelSearchState) => ({
    searchResults: state.searchResults,
    setSortBy: state.setSortBy
})

export function DiseaseModelSearchResults({
    searchParams,
    isInitialized,
}: {
    searchParams?: SearchParams | undefined
    isInitialized: boolean
}) {
    const { 
        searchResults,
        setSortBy
    } = useDiseaseModelSearchStore(useShallow(selector))
    const columns = useDiseaseModelsTableColumns()

    setSortBy(searchParams?.sort)

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
                    <DiseaseModelsTable data={searchResults} pageCount={1} columns={columns} searchParams={{}}/>
                </div>
            )}
        </div>
    )
}
