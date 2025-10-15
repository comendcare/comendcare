"use client"

import { initializeBiosampleSearch } from "@/packages/lib/initialize-client-state";
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

interface ProjectLayoutProps {
    children: React.ReactNode
}

const selector = (state: BiosampleSearchState) => ({
    initialized: state.initialized
})

export default function MarketplaceBiosamplesLayout({children}: ProjectLayoutProps) {
    const {initialized} = useBiosampleSearchStore(useShallow(selector))

    // initial fetch on mount - initialize automatically calls first typesense search
    useEffect(() => {
        if (!initialized) {
            initializeBiosampleSearch({
                types: [] as any[],
                genes: [] as any[],
                conditions: [] as any[],
                organizations: [] as any[],
            })
            console.log(`Biosample search initialized...`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (<>{children}</>)
}
