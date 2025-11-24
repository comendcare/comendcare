"use client"

import React, {useEffect, useState} from "react"
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore";
import { useShallow } from "zustand/react/shallow";
import InfiniteScroll from "@comend/components/ui/infinite-scroll";
import {CROMarketplaceCard} from "@comend/components/marketplace/marketplace-cro-card";
import {CROMarketplaceListElement} from "@comend/components/marketplace-cro-list-element";
import { Skeleton } from "@comend/components/ui/skeleton";
import { NoResultsView } from "../no-results";
import {useSession} from "next-auth/react";
import {getSavedCompaniesFromOrganizationId} from "@comend/lib/fetchers";
import {SavedCompany} from "@prisma/client";
import { LoaderCircle } from "lucide-react";
import { cn } from "@comend/lib/utils";

const selector = (state: CROSearchState) => ({
    lastFetchedPage: state.lastFetchedPage,
    setLastFetchedPage: state.setLastFetchedPage,
    view: state.view,
    searchResults: state.searchResults,
    totalResults: state.totalResults
})

export function CROSearchResults() {
    const {data: session, status} = useSession()
    const [savedCompanyIds, setSavedCompanyIds] = useState<Set<string>>(new Set());
    const {
        lastFetchedPage, 
        setLastFetchedPage, 
        view, 
        searchResults,
        totalResults
    } = useCROSearchStore(useShallow(selector))

    useEffect(() => {
        async function fetchSavedCompanies() {
            if (status === "authenticated" && !session?.user?.organizationId) return;

            const res = await getSavedCompaniesFromOrganizationId(session?.user.organizationId, {
                companyId: true,
            });

            if (res.success && res.data) {
                setSavedCompanyIds(new Set(res.data.map((c: SavedCompany) => c.companyId)));
            }
        }

        fetchSavedCompanies();
    }, [session?.user.organizationId, status]);

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
                    <NoResultsView />
                ): (
                    <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                        {searchResults.map((cro, index) => (
                            <CROMarketplaceCard
                                cro={cro}
                                key={index}
                                location={"Marketplace"}
                                savedCompanyIds={savedCompanyIds}
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
