"use client"

import React from "react"
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore";
import { useShallow } from "zustand/react/shallow";
import InfiniteScroll from "./ui/infinite-scroll";
import Image from "next/image";
import ComendLoadingSpinner from "./comend-loading-spinner";
import {CROMarketplaceCard} from "@/components/marketplace-cro-card";
import {CROMarketplaceListElement} from "@/components/marketplace-cro-list-element";
import { Card, CardContent } from "./ui/card";
import {AdminCROCard} from "@/components/admin-cro-card";

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
                <div>
                    <Image
                        alt="No recommendations"
                        src="https://illustrations.popsy.co/white/question-mark.svg"
                        width={300}
                        height={300}
                        className="dark:hidden"
                    />
                    <Image
                        alt="No recommendations"
                        src="https://illustrations.popsy.co/white/question-mark.svg"
                        width={300}
                        height={300}
                        className="hidden dark:block"
                    />
                </div>
                <div className="flex flex-col justify-center gap-4 items-start">
                    <h2 className="text-xl">{`Sorry, we don't have any results for that search`}</h2>
                    <p className="text-md">
                        {`Please try another search.`}
                    </p>
                </div>
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
