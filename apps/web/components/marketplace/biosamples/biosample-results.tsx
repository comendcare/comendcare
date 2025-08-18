"use client"

import React from "react"
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore"
import { useShallow } from "zustand/react/shallow";
import InfiniteScroll from "@comend/components/ui/infinite-scroll";
import Image from "next/image";
import {CROMarketplaceCard} from "~web/components/marketplace/marketplace-cro-card";
import {CROMarketplaceListElement} from "@comend/components/marketplace-cro-list-element";
import { Card, CardContent } from "@comend/components/ui/card";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import { BiosamplesTable } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table";
import { useBiosamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns";

const selector = (state: BiosampleSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults
})

export function BiosampleSearchResults() {
    const { 
        lastFetchedPage, 
        setLastFetchedPage, 
        view, 
        searchResults 
    } = useBiosampleSearchStore(useShallow(selector))
    const columns = useBiosamplesTableColumns()

    if (!searchResults) {
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

    const ResultsView = () => {
        // default to grid view
        return (
            <div className="w-full max-w-full flex flex-col gap-4">
                {(!searchResults || searchResults.length === 0) ? (
                    <NoResultsView />
                ): (
                    <div className="max-w-7xl w-full overflow-auto">
                        <BiosamplesTable data={searchResults} pageCount={1} columns={columns} searchParams={{}}/>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <ResultsView />
            {/* <InfiniteScroll 
                lastFetchedPage={lastFetchedPage} 
                setLastFetchedPage={setLastFetchedPage}
            /> */}
        </>
    )
}
