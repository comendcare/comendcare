"use client"

import { initializeDiseaseModelSearch } from "@/packages/lib/initialize-client-state";
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

interface ProjectLayoutProps {
    children: React.ReactNode
}

const selector = (state: DiseaseModelSearchState) => ({
    initialized: state.initialized
})

export default function MarketplaceDiseaseModelLayout({children}: ProjectLayoutProps) {
    const {initialized} = useDiseaseModelSearchStore(useShallow(selector))

    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        if (!initialized) {
            initializeDiseaseModelSearch({
                types: [] as any[],
                genes: [] as any[],
                conditions: [] as any[],
                organizations: [] as any[],
            })
            console.log(`Disease Model search initialized...`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (<>{children}</>)
}
