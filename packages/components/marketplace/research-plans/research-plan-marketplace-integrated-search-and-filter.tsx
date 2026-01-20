"use client"

import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Funnel, X} from "lucide-react"
import {useShallow} from "zustand/react/shallow"
import {Button} from "@comend/components/ui/button"
import {Input} from "@comend/components/ui/input"
import {Label} from "@comend/components/ui/label"
import {Separator} from "@comend/components/ui/separator"
import {debounce, filter} from "lodash";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { ResearchPlanSearchState, useResearchPlanSearchStore } from "@/state/search/researchPlanSearchStore"
import MultipleSelector from "@comend/components/ui/multiple-selector"
import { RFP_OPEN_TO_TYPE_OPTIONS, Option, RFP_STATUS_TYPE_OPTIONS, RESEARCH_PLAN_STATUS, RESEARCH_STAGE } from "@comend/lib/types"
import { Badge, badgeVariants } from "@comend/components/ui/badge"
import { handleAsyncConditionSearch, handleAsyncGeneSearch } from "@comend/lib/utils"

export function ResearchPlanMarketplaceIntegratedSearchAndFilter() {
    const {searchTerm, sortBy, setSortBy, setSearchTerm, filters, setFilters, totalResults} = useResearchPlanSearchStore(
        useShallow((state: ResearchPlanSearchState) => ({
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
        setFilters({ ...filters, stages: [], statuses: [] });
    }

    // helper to update a single filter key from MultipleSelector
    const setFilterKey = (key: keyof typeof filters, value: { label: string; value: string }[]) =>
        setFilters({...filters, [key]: value})

    const removeFilterItem = (key: keyof typeof filters, value: string) =>
        setFilters({...filters, [key]: (filters[key] || []).filter((i: any) => i.value !== value)})

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
        (filters.stages?.length || 0) +
        (filters.statuses?.length || 0)

    return (
        <div className="w-full mx-auto flex flex-col gap-y-2">
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm">
                {/* Search input */}
                <div className="flex-1 px-6 py-4">
                    <Label className="text-base font-semibold text-gray-900">Search</Label>
                    <Input
                        type="text"
                        placeholder="Title, scope, condition, gene..."
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
                        <DialogTitle>Research Plan Filters</DialogTitle>
                            {/* Stages */}
                            <div>
                                <Label>Stages</Label>
                                <MultipleSelector
                                    value={filters.stages ?? []}
                                    onChange={(vals) => setFilterKey("stages", vals)}
                                    defaultOptions={RESEARCH_STAGE}
                                    placeholder="Select stage..."
                                    hidePlaceholderWhenSelected
                                    commandProps={{className: "bg-transparent"}}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                    }
                                    showHoverCard={false}
                                />
                            </div>

                            {/* Statuses */}
                            <div>
                                <Label>Status</Label>
                                <MultipleSelector
                                    value={filters.statuses ?? []}
                                    onChange={(vals) => setFilterKey("statuses", vals)}
                                    defaultOptions={RESEARCH_PLAN_STATUS}
                                    placeholder="Select status..."
                                    hidePlaceholderWhenSelected
                                    commandProps={{className: "bg-transparent"}}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                    }
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
                        {(filters.stages || []).map((item) => (
                            <Badge key={`stages-${item.value}`} variant="secondary" className="text-xs">
                                {item.label}
                                <button
                                    onClick={() => removeFilterItem("stages", item.value)}
                                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}

                        {(filters.statuses || []).map((item) => (
                            <Badge key={`statuses-${item.value}`} variant="secondary" className="text-xs">
                                {item.label}
                                <button
                                    onClick={() => removeFilterItem("statuses", item.value)}
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
