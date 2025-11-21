"use client"

import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Funnel, X} from "lucide-react"
import {useShallow} from "zustand/react/shallow"
import {Button} from "@comend/components/ui/button"
import {Input} from "@comend/components/ui/input"
import {Label} from "@comend/components/ui/label"
import {Separator} from "@comend/components/ui/separator"
import {debounce} from "lodash";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { ResearcherSearchState, useResearcherSearchStore } from "@/state/search/researcherSearchStore"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { MILESTONE_TYPE_OPTIONS, MODALITIES } from "@comend/lib/types"
import { Badge, badgeVariants } from "@comend/components/ui/badge"
import { handleAsyncConditionSearch, handleAsyncGeneSearch } from "@comend/lib/utils"

export function ResearcherMarketplaceIntegratedSearchAndFilter() {
    const {searchTerm, sortBy, setSortBy, setSearchTerm, filters, setFilters, totalResults} = useResearcherSearchStore(
        useShallow((state: ResearcherSearchState) => ({
            searchTerm: state.searchTerm,
            setSearchTerm: state.setSearchTerm,
            sortBy: state.sortBy,
            setSortBy: state.setSortBy,
            filters: state.filters,
            setFilters: state.setFilters,
            totalResults: state.totalResults,
        }))
    )
    const dialogRef = useRef<HTMLDivElement>(null)

    const [query, setQuery] = useState(searchTerm)

    const clearAll = () => {
        setFilters({ ...filters, researchInterests: [], therapeuticsOfInterest: [], conditionsOfInterest: [], genes: [] });
    }

    // helper to update a single filter key from MultipleSelector
    const setFilterKey = (key: keyof typeof filters, value: { label: string; value: string }[]) =>
        setFilters({...filters, [key]: value})

    const removeFilterItem = (key: keyof typeof filters, value: string) =>
        setFilters({...filters, [key]: (filters[key] || []).filter((i) => i.value !== value)})

    // keep searchTerm input in sync if the store changes elsewhere
    useEffect(() => setQuery(searchTerm), [searchTerm])

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

    const activeCount =
        filters.researchInterests?.length || 0 +
        filters.therapeuticsOfInterest?.length || 0 +
        filters.conditionsOfInterest?.length || 0 +
        filters.genes?.length || 0

    return (
        <div className="w-full mx-auto flex flex-col gap-y-2">
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm">
                {/* Search input */}
                <div className="flex-1 px-6 py-4">
                    <Label className="text-base font-semibold text-gray-900">Search</Label>
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const search: string = e.target.value
                            setQuery(search)
                            debounceHandleInputChange(search)
                        }}
                        className="border-0 p-0 text-sm text-gray-600 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                <Separator orientation="vertical" className="h-8" />

                {/* Mobile and additional filters */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="m-4 rounded-full" variant={'cta'}>
                            <Funnel />
                            Filters
                        </Button>
                    </DialogTrigger>
                    <DialogContent
                        ref={dialogRef}
                        onOpenAutoFocus={(e) => {
                            e.preventDefault() // prevent focusing the first input
                            dialogRef.current?.focus() // focus the dialog content instead
                        }}
                    >
                        <DialogTitle>Researcher Filters</DialogTitle>
                            {/* Research Interests */}
                            <div>
                                <Label>Research interests</Label>
                                <MultipleSelector
                                    value={filters.researchInterests ?? []}
                                    onChange={(vals) => setFilterKey("researchInterests", vals)}
                                    options={MILESTONE_TYPE_OPTIONS}
                                    placeholder="Select option..."
                                    hidePlaceholderWhenSelected
                                    commandProps={{className: "bg-transparent"}}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                    }
                                    triggerSearchOnFocus={true}
                                    showHoverCard={false}
                                />
                            </div>

                            {/* Therapeutis of interest */}
                            <div>
                                <Label>Therapeutics of interest</Label>
                                <MultipleSelector
                                    value={filters.therapeuticsOfInterest ?? []}
                                    onChange={(vals) => setFilterKey("therapeuticsOfInterest", vals)}
                                    defaultOptions={MODALITIES}
                                    placeholder="Select option..."
                                    hidePlaceholderWhenSelected
                                    commandProps={{className: "bg-transparent"}}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                    }
                                    showHoverCard={false}
                                />
                            </div>

                            {/* Conditions of Interest */}
                            <div>
                                <Label>Conditions of interest</Label>
                                <MultipleSelector
                                    value={filters.conditionsOfInterest ?? []}
                                    onChange={(vals) => setFilterKey("conditionsOfInterest", vals)}
                                    onSearch={handleAsyncConditionSearch}
                                    placeholder="Select conditions..."
                                    hidePlaceholderWhenSelected
                                    commandProps={{className: "bg-transparent"}}
                                    loadingIndicator={<p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading conditions...</p>}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                    }
                                    triggerSearchOnFocus={true}
                                    showHoverCard={false}
                                />
                            </div>

                            {/* Genes */}
                            <div>
                                <Label>Gene of interest</Label>
                                <MultipleSelector
                                    value={filters.genes ?? []}
                                    badgeClassName={badgeVariants({variant: "teal"})}
                                    onChange={(vals) => setFilterKey("genes", vals)}
                                    onSearch={handleAsyncGeneSearch}
                                    placeholder="Select genes..."
                                    hidePlaceholderWhenSelected
                                    commandProps={{className: "bg-transparent"}}
                                    loadingIndicator={<p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading genes...</p>}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                    }
                                    triggerSearchOnFocus={true}
                                    showHoverCard={false}
                                />
                            </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Active filter badges */}
            <div className="flex flex-row gap-2 items-center">
                {activeCount > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        {/* researchInterests */}
                        {(filters.researchInterests || []).map((item) => (
                            <Badge key={`research-${item.value}`} variant="secondary" className="text-xs">
                                {item.label}
                                <button
                                    onClick={() => removeFilterItem("researchInterests", item.value)}
                                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}

                        {/* therapeutics of interest */}
                        {(filters.therapeuticsOfInterest || []).map((item) => (
                            <Badge key={`therapeutics-${item.value}`} variant="secondary" className="text-xs">
                                {item.label}
                                <button
                                    onClick={() => removeFilterItem("therapeuticsOfInterest", item.value)}
                                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}

                        {/* conditions of interest */}
                        {(filters.conditionsOfInterest || []).map((item) => (
                            <Badge key={`conditions-${item.value}`} variant="secondary" className="text-xs">
                                {item.label}
                                <button
                                    onClick={() => removeFilterItem("conditionsOfInterest", item.value)}
                                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}

                        {/* genes */}
                        {(filters.genes || []).map((item) => (
                            <Badge key={`genes-${item.value}`} variant="secondary" className="text-xs">
                                {item.value}
                                <button
                                    onClick={() => removeFilterItem("genes", item.value)}
                                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}

                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs">
                            Clear all
                        </Button>
                    </div>
                )}
            </div>

            <div className="w-full flex flex-row justify-between items-center">
                {/* Result Count */}
                <div className="mt-2 text-sm text-muted-foreground">
                    {typeof totalResults === "number" ? `${totalResults} results` : "Loading results..."}
                </div>
            </div>
        </div>
    )
}
