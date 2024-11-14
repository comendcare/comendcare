"use client"

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { typesense } from "@/lib/typesense";
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore";
import { useShallow } from "zustand/react/shallow"

const selector = (state: OrganizationSearchState) => ({
    setSearchResults: state.setSearchResults
})

export default function MarketplaceSearchBar() {
    const [query, setQuery] = useState("")

    useEffect(() => {
        handleSearch("")
    }, [])

    const { setSearchResults } = useOrganizationSearchStore(useShallow(selector))

    const handleSearch = async (searchTerm: string) => {
        try {
            const searchParameters = {
                q: searchTerm,
                query_by: "name",
                // Uncomment the following line if you want results sorted by a field
                // sort_by: "numberOfIdentifiedPatients:desc",
            };

            const results = await typesense
                .collections("organizations")
                .documents()
                .search(searchParameters);

            setSearchResults(results.hits || [])
            console.log(`search results`, results.hits)

        } catch (error) {
            console.error("Search error:", error);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setQuery(searchTerm);
        handleSearch(searchTerm);
    };

    return (
        <Input
            className="w-full"
            placeholder="Search"
            value={query}
            onChange={handleInputChange}
        />
    );
}
