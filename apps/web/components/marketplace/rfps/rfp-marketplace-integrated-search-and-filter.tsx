"use client"

import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Funnel} from "lucide-react"
import {useShallow} from "zustand/react/shallow"
import {Button} from "@comend/components/ui/button"
import {Input} from "@comend/components/ui/input"
import {Label} from "@comend/components/ui/label"
import {Separator} from "@comend/components/ui/separator"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@comend/components/ui/select";
import {debounce} from "lodash";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/packages/components/ui/dialog";
import { RFPSearchState, useRFPSearchStore } from "@/state/search/rfpSearchStore"

export function RFPMarketplaceIntegratedSearchAndFilter() {
    const {searchTerm, sortBy, setSortBy, setSearchTerm, filters, setFilters, totalResults} = useRFPSearchStore(
        useShallow((state: RFPSearchState) => ({
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
        setFilters({ ...filters, conditions: [], genes: [], openTo: [], status: [], organizations: [] });
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

    return (
        <div className="w-full mx-auto flex flex-col gap-y-2">
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm">
                {/* Search input */}
                <div className="flex-1 px-6 py-4">
                    <Label className="text-base font-semibold text-gray-900">Search</Label>
                    <Input
                        type="text"
                        placeholder="Title, scope, eligibility, evaluation process..."
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
                        <DialogTitle>Service Provider Filters</DialogTitle>
                            {/* Project Types */}
                            {/* <div>
                                <Label>Project Types</Label>
                                <MultipleSelector
                                    value={filters.milestoneTypes}
                                    onChange={(vals) => setFilterKey("milestoneTypes", vals)}
                                    defaultOptions={MILESTONE_TYPE_OPTIONS_WITH_VALUE}
                                    placeholder="Select project types..."
                                    hidePlaceholderWhenSelected
                                    commandProps={{className: "bg-transparent"}}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                    }
                                />
                            </div> */}
                    </DialogContent>
                </Dialog>
            </div>

            {/* <div className="flex flex-row gap-2 items-center">
                {true &&
                    // filters.milestoneTypes.length ||
                    // filters.types.length ||
                    // filters.certifications.length ||
                    // filters.tags.length) > 0 && 
                    (
                    <div className="flex flex-wrap gap-2 items-center">
                        {[
                            // {key: "milestoneTypes", options: MILESTONE_TYPE_OPTIONS_WITH_VALUE},
                            // {key: "types", options: BUSINESS_TYPES},
                            // {key: "certifications", options: CRO_CERTIFICATIONS},
                            // {key: "tags", options: CRO_TAGS},
                        ]
                            .flatMap(({key, options}) =>
                                // @ts-ignore — keys align with FiltersType
                                (filters[key] || []).map((item: { value: string }) => (
                                    <Badge key={`${key}-${item.value}`} variant="secondary" className="text-xs">
                                        {options.find((opt) => opt.value === item.value)?.label || item.value}
                                        <button
                                            onClick={() => removeFilterItem(key as any, item.value)}
                                       s     className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                                        >
                                            <X className="h-3 w-3"/>
                                        </button>
                                    </Badge>
                                ))
                            )}
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                            Clear all
                        </Button>
                    </div>
                )}
            </div> */}

            <div className="w-full flex flex-row justify-between items-center">
                {/* Result Count */}
                <div className="mt-2 text-sm text-muted-foreground">
                    {typeof totalResults === "number" ? `${totalResults} results` : "Loading results..."}
                </div>
            </div>
        </div>
    )
}
