"use client"

import { initializeOrganizationSearch } from "@/packages/lib/initialize-client-state";
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

interface ProjectLayoutProps {
    children: React.ReactNode
}

const selector = (state: OrganizationSearchState) => ({
    initialized: state.initialized
})

export default function MarketplaceOrganizationLayout({children}: ProjectLayoutProps) {
    const {initialized} = useOrganizationSearchStore(useShallow(selector))

    // initial fetch on mount
    useEffect(() => {
        if (!initialized) {
            const parsedPAGFilters = {
                genes: [] as any[],
                conditions: [] as any[],
                systems: [] as any[],
                mechanisms: [] as any[],
                modalities: [] as any[],
            }
            initializeOrganizationSearch(parsedPAGFilters)
            console.log(`Organization search initialized...`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (<>{children}</>)
}
