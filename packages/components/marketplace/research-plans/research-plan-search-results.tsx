"use client"

import React from "react"
import { useShallow } from "zustand/react/shallow";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import { ResearchPlanSearchState, useResearchPlanSearchStore } from "@/state/search/researchPlanSearchStore";
import Link from "next/link";
import { ResearchPlanCard } from "@comend/components/research-plan-card";
import { LoaderCircle } from "lucide-react";
import { cn } from "@comend/lib/utils";
import InfiniteScroll from "@comend/components/ui/infinite-scroll";

const selector = (state: ResearchPlanSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults,
    totalResults: state.totalResults,
})

export function ResearchPlanSearchResults({
    isInitialized
}: {
    isInitialized: boolean
}) {
    const { lastFetchedPage, setLastFetchedPage, view, searchResults, totalResults } = useResearchPlanSearchStore(useShallow(selector))

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
        return (
            <div className="w-full flex flex-col gap-4">
                {(!searchResults || searchResults.length === 0) ? (
                    <NoResultsView />
                ): (
                    <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                        {searchResults.map((researchPlan, index) => (
                            <Link href={`/app/research-plan/${researchPlan.id}`} className="h-full">
                                <ResearchPlanCard researchPlan={researchPlan} showOrganization={true}/>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <ResultsView />
            <LoaderCircle 
                className={cn("h-[40px] w-[40px] animate-spin", (
                    !searchResults ||
                    searchResults.length === totalResults || 
                    searchResults.length === 0
                ) && "opacity-0")}
            />
            <InfiniteScroll 
                lastFetchedPage={lastFetchedPage} 
                setLastFetchedPage={setLastFetchedPage}
            />
        </>
    )

    // return (
    //     <div className="w-full max-w-full flex flex-col gap-4">
    //         {(!searchResults || searchResults.length === 0) ? (
    //             <NoResultsView />
    //         ): (
    //             // <div className="max-w-7xl w-full overflow-auto">
    //             //     <TypesenseResearchPlansTable 
    //             //         data={searchResults} 
    //             //         pageCount={1} 
    //             //         columns={columns} 
    //             //         searchParams={{}}
    //             //     />
    //             // </div>

    //             <div className="max-w-7xl w-full overflow-auto grid grid-cols-3 gap-4">
    //                 {searchResults.map((researchPlan: any) => (
    //                     <Link href={`/app/research-plan/${researchPlan.id}`} className="h-full">
    //                         <ResearchPlanCard researchPlan={researchPlan} showOrganization={true}/>
    //                     </Link>
    //                 ))}
    //             </div>
    //         )}
    //     </div>
    // )
}
