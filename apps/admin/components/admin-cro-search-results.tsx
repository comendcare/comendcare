"use client"

import React from "react"
import {CROSearchState, useCROSearchStore} from "@/state/search/croSearchStore";
import {useShallow} from "zustand/react/shallow";
import InfiniteScroll from "@comend/components/ui/infinite-scroll";
import Image from "next/image";
import ComendLoadingSpinner from "@comend/components/comend-loading-spinner";
import {CROMarketplaceListElement} from "@comend/components/marketplace-cro-list-element";
import {Card, CardContent} from "@comend/components/ui/card";
import {AdminCROCard} from "~admin/components/admin-cro-card";
import { NoResultsTemplate } from "@comend/components/no-results";

const selector = (state: CROSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults
})

export const AdminNoResultsView = () => {
    return (
        <Card className="w-full flex flex-col mx-auto justify-center items-center align-center">
            <CardContent className="flex gap-4 p-4">
                <NoResultsTemplate 
                    imgAlt="No results"
                    src="https://illustrations.popsy.co/white/question-mark.svg"
                    title="Sorry, we don't have any results for that search"
                    description="Please try another search."
                />
            </CardContent>
        </Card>
    )
}

export function AdminCROSearchResults() {
    const { 
        lastFetchedPage, 
        setLastFetchedPage, 
        view, 
        searchResults 
    } = useCROSearchStore(useShallow(selector))

    if (!searchResults) return <ComendLoadingSpinner />

    const ResultsView = () => {
        if (view === "list") {
            return (
                <ol className="w-full flex flex-col gap-4">
                    {searchResults.map((cro, index) => (
                        <CROMarketplaceListElement cro={cro} key={index}/>
                    ))}
                </ol>
            )
        }

        // default to grid view
        return (
            <div className="w-full flex flex-col gap-4">
                {(!searchResults || searchResults.length === 0) ? (
                    <AdminNoResultsView />
                ): (
                    <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                        {searchResults.map((cro, index) => (
                            <AdminCROCard cro={cro} key={index} location={"Marketplace"}/>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <ResultsView />
            <InfiniteScroll 
                lastFetchedPage={lastFetchedPage} 
                setLastFetchedPage={setLastFetchedPage}
            />
        </>
    )
}
