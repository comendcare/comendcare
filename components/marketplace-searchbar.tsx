"use client"

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { typesense } from "@/lib/typesense";
import { OrganizationSearchState, useOrganizationSearchStore, ViewType } from "@/state/search/organizationSearchStore";
import { useShallow } from "zustand/react/shallow"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const selector = (state: OrganizationSearchState) => ({
    view: state.view,
    setView: state.setView,
    filters: state.filters,
    setSearchResults: state.setSearchResults
})

const sortByFilters: { [key: string]: string } = {
    "alphabetical": "name:asc",
    "patients-low-high": "numberOfIdentifiedPatients:asc",
    "patients-high-low": "numberOfIdentifiedPatients:desc",
    "prevalence-low-high": "prevalenceRatio:asc",
    "prevalence-high-low": "prevalenceRatio:desc",
    "money-raised-low-high": "moneyRaised:asc",
    "money-raised-high-low": "moneyRaised:desc"
}

function generateFiltersString() {
    return ""
}

export default function MarketplaceSearchBar() {
    const [query, setQuery] = useState("")
    const [sortBy, setSortBy] = useState<string | undefined>()
    const [searchTerm, setSearchTerm] = useState<string>("")
    const { view, setView, filters, setSearchResults } = useOrganizationSearchStore(useShallow(selector))

    useEffect(() => {
        handleSearch()
    }, [filters, sortBy, searchTerm])

    const handleSearch = async () => {
        try {
            const searchParameters = {
                q: searchTerm,
                query_by: "name",
                ...(filters ? { filterBy: generateFiltersString() } : undefined),
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
            <SelectItem value="prevalence-low-high">Prevalence (Low-High)</SelectItem>
            <SelectItem value="prevalence-high-low">Prevalence (High-Low)</SelectItem>
            <SelectItem value="money-raised-low-high">$ Raised (Low-High)</SelectItem>
            <SelectItem value="money-raised-high-low">$ Raised (High-Low)</SelectItem>
            </SelectGroup>
        </SelectContent>
        </Select>

        <Select
            onValueChange={(view: string) => {
                setView(view as ViewType)
            }}
            defaultValue={view}
        >
        <SelectTrigger className="w-[150px] h-full">
            <SelectValue placeholder="View" />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
            <SelectItem value="grid">Grid View</SelectItem>
            <SelectItem value="list">List View</SelectItem>
            </SelectGroup>
        </SelectContent>
        </Select>
        </div>
    );
}
