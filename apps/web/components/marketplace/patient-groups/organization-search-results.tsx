"use client"

import React, {useEffect, useState} from "react"
import { OrganizationMarketplaceCard } from "~web/components/marketplace/marketplace-pag-card";
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore";
import { useShallow } from "zustand/react/shallow";
import { OrganizationMarketplaceListElement } from "../marketplace-pag-list-element";
import InfiniteScroll from "@comend/components/ui/infinite-scroll";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import {getSavedCompaniesFromOrganizationId, getSavedOrganizationsFromOrganizationId} from "@/packages/lib/fetchers";
import {SavedCompany, SavedOrganization} from "@prisma/client";
import {useSession} from "next-auth/react";
import {SavedOrganizationData} from "@/packages/lib/types";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/packages/lib/utils";

const selector = (state: OrganizationSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults,
    totalResults: state.totalResults,
})

export function OrganizationSearchResults({isPublic}: {isPublic: boolean}) {
    const {data: session, status} = useSession()
    const { lastFetchedPage, setLastFetchedPage, view, searchResults, totalResults } = useOrganizationSearchStore(useShallow(selector))
    const [savedOrganizationIds, setSavedOrganizationIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchData() {
            const savedOrganizationsResponse = await getSavedOrganizationsFromOrganizationId(session?.user?.organizationId || undefined, {
                id: true,
                organizationId: true,
                organization: true,
                savedOrganizationId: true,
                savedOrganization: true,
                updatedAt: true,
                createdAt: true,
                metadata: true
            });
            if (savedOrganizationsResponse.success) {
                const savedOrganizationData = savedOrganizationsResponse.data as SavedOrganization[];
                setSavedOrganizationIds(new Set(savedOrganizationData.map((c: SavedOrganization) => c.savedOrganizationId)));
            } else {
                console.error(savedOrganizationsResponse.error);
            }
        }

        fetchData();
    }, [session, status])

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
        if (view === "list") {
            return (
                <ol className="w-full flex flex-col gap-4">
                    {searchResults.map((organization, index) => (
                        <OrganizationMarketplaceListElement organization={organization} key={index} isPublic={isPublic} />
                    ))}
                </ol>
            )
        }

        // default to grid view
        return (
            <div className="w-full flex flex-col gap-4">
                {(!searchResults || searchResults.length === 0) ? (
                    <NoResultsView />
                ): (
                    <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                        {searchResults.map((organization, index) => (
                            <OrganizationMarketplaceCard
                                organization={organization}
                                key={index}
                                isPublic={isPublic}
                                savedOrganizationIds={savedOrganizationIds}
                            />
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
