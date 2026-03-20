"use client"

import React, { useEffect, useState } from "react"
import { useShallow } from "zustand/react/shallow";
import { initializeProjectSearch } from "@comend/lib/initialize-client-state";
import { ProjectSearchState, useProjectSearchStore } from "@/state/search/projectSearchStore";
import { ProjectMarketplaceIntegratedSearchAndFilter } from "@comend/components/marketplace/projects/project-marketplace-integrated-search-and-filter";
import { ProjectSearchResults } from "@comend/components/marketplace/projects/project-search-results";
import { SearchParams } from "@comend/components/types";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

const selector = (state: ProjectSearchState) => ({
    initialized: state.initialized,
    setSortBy: state.setSortBy
})

export default function ProjectPage(props: IndexPageProps) {
    const {initialized, setSortBy} = useProjectSearchStore(useShallow(selector))
    const [isInitialized, setIsInitialized] = useState(false)
 
    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        const init = async () => {
            const searchParams = await props.searchParams;
            
            if (!initialized) {
                await initializeProjectSearch(
                    {
                        types: [] as any[],
                        status: [] as any[],
                        budgetRange: [] as any[]
                    },
                )
                console.log(`Biosample search initialized...`)
            }

            setIsInitialized(true)
        }

        init()
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="flex flex-col w-full px-4 pb-20 items-center h-full">
            <div className="flex flex-col gap-4 p-2 w-full items-center align-center">
                <ProjectMarketplaceIntegratedSearchAndFilter />
                <ProjectSearchResults isInitialized={isInitialized}/>
            </div>
        </main>
    )
}
