"use client"

import React from "react"
import { useShallow } from "zustand/react/shallow";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import { ProjectSearchState, useProjectSearchStore } from "@/state/search/projectSearchStore";
import Link from "next/link";
// import { ProjectCard } from "@comend/components/research-plan-card";
import { LoaderCircle } from "lucide-react";
import { cn } from "@comend/lib/utils";
import InfiniteScroll from "@comend/components/ui/infinite-scroll";
import { MilestoneMarketplaceCard } from "@comend/components/marketplace/marketplace-milestone-card";

const selector = (state: ProjectSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults,
    totalResults: state.totalResults,
})

export function ProjectSearchResults({
    isInitialized
}: {
    isInitialized: boolean
}) {
    const { lastFetchedPage, setLastFetchedPage, view, searchResults, totalResults } = useProjectSearchStore(useShallow(selector))

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
                        {searchResults.map((project, index) => (
                            <Link
                                href={(
                                    project.organization.subdomain 
                                        ? `http://${project.organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${project?.id}` 
                                        : '#'
                                )}
                            >
                                {/* <ProjectCard project={project} showOrganization={true}/> */}
                                {/* <p>{project.organization.name}</p> */}
                                <MilestoneMarketplaceCard milestone={project}/>
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
}
