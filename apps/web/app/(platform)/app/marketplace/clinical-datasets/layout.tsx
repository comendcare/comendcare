"use client"

import { initializeClinicalDatasetSearch } from "@/packages/lib/initialize-client-state";
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

interface ProjectLayoutProps {
    children: React.ReactNode
}

const selector = (state: ClinicalDatasetSearchState) => ({
    initialized: state.initialized
})

export default function MarketplaceClinicalDatasetsLayout({children}: ProjectLayoutProps) {
    const {initialized} = useClinicalDatasetSearchStore(useShallow(selector))

    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        if (!initialized) {
            initializeClinicalDatasetSearch({
                types: [] as any[],
                genes: [] as any[],
                conditions: [] as any[],
                organizations: [] as any[]
            })
            console.log(`Clinical Dataset search initialized...`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (<>{children}</>)
}
