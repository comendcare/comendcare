"use client"

import { initializeCROSearch } from "@/packages/lib/initialize-client-state";
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

interface ProjectLayoutProps {
    children: React.ReactNode
}

const selector = (state: CROSearchState) => ({
    initialized: state.initialized
})

export default function MarketplaceOrganizationLayout({children}: ProjectLayoutProps) {
    const {initialized} = useCROSearchStore(useShallow(selector))

    // initial fetch on mount
    useEffect(() => {
        if (!initialized) {
            const parsedCROFilters = {
                categories: [] as any[],
                milestoneTypes: [] as any[],
                types: [] as any[],
                certifications: [] as any[],
                tags: [] as any[],
            }
            initializeCROSearch(parsedCROFilters)
            console.log(`CRO search initialized...`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (<>{children}</>)
}
