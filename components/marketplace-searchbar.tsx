"use client"

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { typesense } from "@/lib/typesense";
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore";
import { useShallow } from "zustand/react/shallow"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const selector = (state: OrganizationSearchState) => ({
    setSearchResults: state.setSearchResults
})

const sortByFilters: { [key: string]: string } = {
    "alphabetical": "name:asc",
    "patients-low-high": "numberOfIdentifiedPatients:asc",
    "patients-high-low": "numberOfIdentifiedPatients:desc",
    "money-raised-low-high": "moneyRaised:asc",
    "money-raised-high-low": "moneyRaised:desc"
}

export default function MarketplaceSearchBar() {
    const [query, setQuery] = useState("")
    const [sortBy, setSortBy] = useState<string | undefined>()
    const [searchTerm, setSearchTerm] = useState<string>("")

    useEffect(() => {
        handleSearch()
    }, [sortBy, searchTerm])

    const { setSearchResults } = useOrganizationSearchStore(useShallow(selector))

    const handleSearch = async () => {
        try {
            const searchParameters = {
                q: searchTerm,
                query_by: "name",
                ...(sortBy ? { sort_by: sortByFilters[sortBy] } : undefined),
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
        const search = e.target.value
        setQuery(search)
        setSearchTerm(search)
    };

    return (
        <div className="w-full h-full flex flex-row gap-4">
        <div className="w-full h-full grow">
            <Input
                className="w-full h-full"
                placeholder="Search"
                value={query}
                onChange={handleInputChange}
            />
        </div>

        <Select
            onValueChange={(value: string) => {
                setSortBy(value)
            }}
        >
        <SelectTrigger className="w-[220px] h-full">
            <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
            <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
            <SelectItem value="patients-low-high">Patients (Low-High)</SelectItem>
            <SelectItem value="patients-high-low">Patients (High-Low)</SelectItem>
            <SelectItem value="money-raised-low-high">$ Raised (Low-High)</SelectItem>
            <SelectItem value="money-raised-high-low">$ Raised (High-Low)</SelectItem>
            </SelectGroup>
        </SelectContent>
        </Select>
        </div>
    );
}
