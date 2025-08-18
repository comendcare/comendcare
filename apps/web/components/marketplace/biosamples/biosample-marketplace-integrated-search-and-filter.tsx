"use client"

import {useCallback, useEffect, useMemo, useState} from "react"
import {SearchIcon, X} from "lucide-react"
import {cn} from "@comend/lib/utils"
import {useShallow} from "zustand/react/shallow"

import {Button} from "@comend/components/ui/button"
import {Input} from "@comend/components/ui/input"
import {Label} from "@comend/components/ui/label"
import {Badge} from "@comend/components/ui/badge"
import {Separator} from "@comend/components/ui/separator"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@comend/components/ui/select";

import MultipleSelector from "@comend/components/ui/multiple-selector"
import {useCROSearchStore, CROSearchState} from "@/state/search/croSearchStore"
import {
    BUSINESS_TYPES,
    CRO_CERTIFICATIONS,
    CRO_TAGS,
    MILESTONE_TYPE_OPTIONS,
} from "@comend/lib/types"
import {debounce} from "lodash";
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore"

export const MILESTONE_TYPE_OPTIONS_WITH_VALUE = MILESTONE_TYPE_OPTIONS.map((option) => ({
    ...option,
    value: option.id,
}))

export function BiosampleMarketplaceIntegratedSearchAndFilter() {
    const {searchTerm, sortBy, setSortBy, setSearchTerm, filters, setFilters, totalResults} = useBiosampleSearchStore(
        useShallow((state: BiosampleSearchState) => ({
            searchTerm: state.searchTerm,
            setSearchTerm: state.setSearchTerm,
            sortBy: state.sortBy,
            setSortBy: state.setSortBy,
            filters: state.filters,
            setFilters: state.setFilters,
            totalResults: state.totalResults,
        }))
    )

    const [query, setQuery] = useState(searchTerm)

    // const clearAllFilters = () =>
    //     setFilters({...filters, milestoneTypes: [], types: [], certifications: [], tags: [], categories: []})

    // // helper to update a single filter key from MultipleSelector
    // const setFilterKey = (key: keyof typeof filters, value: { label: string; value: string }[]) =>
    //     setFilters({...filters, [key]: value})

    // const removeFilterItem = (key: keyof typeof filters, value: string) =>
    //     setFilters({...filters, [key]: (filters[key] || []).filter((i) => i.value !== value)})

    // keep searchTerm input in sync if the store changes elsewhere
    useEffect(() => setQuery(searchTerm), [searchTerm])

    useEffect(() => {
        setSearchTerm("") // initial fetch on page load
    }, [])

    const handleInputChangeCallback = useCallback(
        (search: string) => {
            setSearchTerm(search)
        },
        [setSearchTerm]
    )

    const debounceHandleInputChange = useMemo(
        () => debounce(handleInputChangeCallback, 500),
        []
    )

    return (
        <div className="w-full mx-auto flex flex-col gap-y-2">
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm">
                {/* Search input */}
                <div className="flex-1 px-6 py-4">
                    <Label className="text-xs font-semibold text-gray-900">Search</Label>
                    <Input
                        type="text"
                        placeholder="Search CROs, services, locations..."
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const search: string = e.target.value
                            setQuery(search)
                            debounceHandleInputChange(search)
                        }}
                        className="border-0 p-0 text-sm text-gray-600 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                <Separator orientation="vertical" className="h-8"/>
            </div>

            <div className="flex flex-row gap-2 items-center">
                {/* Active Filter Badges (kept the same) */}
            </div>

            <div className="w-full flex flex-row justify-between items-center">
                {/* Result Count */}
                <div className="mt-2 text-sm text-muted-foreground">
                    {typeof totalResults === "number" ? `${totalResults} results` : "Loading results..."}
                </div>
                {/* <Select
                    value={sortBy}
                    onValueChange={(value: string) => {
                        setSortBy(value)
                    }}
                >
                    <SelectTrigger className="w-[200px] h-full text-xs">
                        <SelectValue placeholder="Sort by" className="text-xs"/>
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                        <SelectGroup className="text-xs">
                            <SelectItem
                                value="alphabetical"
                                className="text-xs"
                            >
                                Alphabetical (A-Z)
                            </SelectItem>
                            <SelectItem
                                value="highest-rated"
                                className="text-xs"
                            >
                                Highest rated
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select> */}
            </div>
        </div>
    )
}
