"use client"

import React from "react"
import { OrganizationMarketplaceCard } from "@/components/marketplace-pag-card";
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore";
import { useShallow } from "zustand/react/shallow";

const selector = (state: OrganizationSearchState) => ({
    searchResults: state.searchResults
})

export function OrganizationSearchResults() {
    const { searchResults } = useOrganizationSearchStore(useShallow(selector))

    return (
        <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {searchResults.map((organization, index) => (
                <OrganizationMarketplaceCard organization={organization.document} key={index} />
            ))}
            {searchResults.length <= 0 && (
                <div className="h-full w-full flex justify-center align-center">
                    <p className="text-3xl">
                        {`Sorry, we don't have any results for that search`}
                    </p>
                </div>
            )}
        </div>
    )
}