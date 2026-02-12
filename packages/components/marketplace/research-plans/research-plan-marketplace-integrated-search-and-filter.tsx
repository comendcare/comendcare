"use client"

import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Funnel, X} from "lucide-react"
import {useShallow} from "zustand/react/shallow"
import {Button} from "@comend/components/ui/button"
import {Input} from "@comend/components/ui/input"
import {Label} from "@comend/components/ui/label"
import {Separator} from "@comend/components/ui/separator"
import {debounce} from "lodash";
import { ResearchPlanSearchState, useResearchPlanSearchStore } from "@/state/search/researchPlanSearchStore"
import { Badge } from "@comend/components/ui/badge"
import { handleAsyncConditionSearch, handleAsyncGeneSearch } from "@comend/lib/utils"
import dynamic from "next/dynamic"

const ResearchPlanFiltersDialog = dynamic(
    () =>
        import("./research-plan-filters-dialog").then(
            (m) => m.ResearchPlanFiltersDialog
        ),
    {
        ssr: false,
        loading: () => (
            <Button disabled className="m-4 rounded-full" variant={'cta'}>
                <Funnel />
                Filters
            </Button>
        ),
    }
)

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

    // Keep local input in sync with store (e.g., external changes)
    useEffect(() => setQuery(searchTerm), [searchTerm]);

    const clearAll = () => {
        setFilters({ ...filters, stages: [], statuses: [], modalities: [] });
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
        (filters.statuses?.length || 0) + 
        (filters.modalities?.length || 0)

    return (
        <div className="w-full mx-auto flex flex-col gap-y-2">
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm">
                {/* Search input */}
                <div className="flex-1 px-6 py-4">
                    <Label className="text-base font-semibold text-gray-900">Search</Label>
                    <Input
                        type="text"
                        placeholder="Title, description, partners..."
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
                <ResearchPlanFiltersDialog/>
            </div>

            {/* Active filter badges */}
            <div className="flex flex-row gap-2 items-center">
                {activeCount > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        {(filters.modalities || []).map((item) => (
                            <Badge key={`modalities-${item.value}`} variant="lightBlue" className="text-xs">
                                {item.label}
                                <button
                                    onClick={() => removeFilterItem("modalities", item.value)}
                                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}

                        {(filters.stages || []).map((item) => (
                            <Badge key={`stages-${item.value}`} variant={item.variant || "secondary"} className="text-xs">
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
