"use client"

import {useCallback, useEffect, useMemo, useState} from "react"
import {Funnel, SearchIcon, X} from "lucide-react"
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
    DISEASE_MODEL_TYPE_OPTIONS,
    MILESTONE_TYPE_OPTIONS,
} from "@comend/lib/types"
import {debounce} from "lodash";
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/packages/components/ui/dialog";
import type { Option } from "@comend/lib/types"
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore"
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore"

export const MILESTONE_TYPE_OPTIONS_WITH_VALUE = MILESTONE_TYPE_OPTIONS.map((option) => ({
    ...option,
    value: option.id,
}))

export function DiseaseModelMarketplaceIntegratedSearchAndFilter() {
    const {searchTerm, sortBy, setSortBy, setSearchTerm, filters, setFilters, totalResults} = useDiseaseModelSearchStore(
        useShallow((state: DiseaseModelSearchState) => ({
            searchTerm: state.searchTerm,
            setSearchTerm: state.setSearchTerm,
            sortBy: state.sortBy,
            setSortBy: state.setSortBy,
            filters: state.filters,
            setFilters: state.setFilters,
            totalResults: state.totalResults,
        }))
    )
    const {
        setFilters: setOrganizationFilters,
        filters: organizationFilters,
        setSearchTerm: setOrganizationSearchTerm
    } = useOrganizationSearchStore(
        useShallow((state: OrganizationSearchState) => ({
            setFilters: state.setFilters,
            filters: state.filters,
            setSearchTerm: state.setSearchTerm
        }))
    )
    const {
        setFilters: setBiosampleFilters, 
        filters: biosampleFilters,
        setSearchTerm: setBiosampleSearchTerm
    } = useBiosampleSearchStore(
        useShallow((state: BiosampleSearchState) => ({
            setFilters: state.setFilters,
            filters: state.filters,
            setSearchTerm: state.setSearchTerm
        }))
    )
    const {
        setFilters: setClinicalDatasetFilters,
        filters: clinicalDatasetFilters,
        setSearchTerm: setClinicalDatasetSearchTerm
    } = useClinicalDatasetSearchStore(
        useShallow((state: ClinicalDatasetSearchState) => ({
            setFilters: state.setFilters,
            filters: state.filters,
            setSearchTerm: state.setSearchTerm
        }))
    )

    const [query, setQuery] = useState(searchTerm)

    // Keep local input in sync with store (e.g., external changes)
    useEffect(() => setQuery(searchTerm), [searchTerm]);

    // initial fetch on mount
    useEffect(() => {
        // reset to trigger initial load using store's logic
        setSearchTerm(searchTerm || "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChangeCallback = useCallback(
        (search: string) => {
            setSearchTerm(search)

            // Handle setting universal search in other marketplaces
            setOrganizationSearchTerm(search);
            setBiosampleSearchTerm(search);
            setClinicalDatasetSearchTerm(search);
        },
        [setSearchTerm]
    )

    const debounceHandleInputChange = useMemo(
        () => debounce(handleInputChangeCallback, 500),
        [handleInputChangeCallback]
    );

    // helper to update a single filter key from MultipleSelector
    const setFilterKey = (key: keyof typeof filters, value: { label: string; value: string }[]) => {
        setFilters({...filters, [key]: value})

        // Handle setting universal filters in other marketplaces (if relevant)
        if (key === 'conditions' || key === 'genes') {
            setOrganizationFilters({...organizationFilters, [key]: value})
            setBiosampleFilters({...biosampleFilters, [key]: value})
            setClinicalDatasetFilters({...clinicalDatasetFilters, [key]: value})
        }
    }

    const removeFilterItem = (key: keyof typeof filters, value: string) => {
        setFilters({...filters, [key]: (filters[key] || []).filter((i) => i.value !== value)})

        // Handle setting universal filters in other marketplaces (if relevant)
        if (key === 'conditions' || key === 'genes') {
            setOrganizationFilters({...organizationFilters, [key]: (organizationFilters[key] || []).filter((i) => i.value !== value)})
            setBiosampleFilters({...biosampleFilters, [key]: (biosampleFilters[key] || []).filter((i) => i.value !== value)})
            setClinicalDatasetFilters({...clinicalDatasetFilters, [key]: (clinicalDatasetFilters[key] || []).filter((i) => i.value !== value)})
        }
    }

    const clearAll = () => {
        setFilters({ ...filters, conditions: [], genes: [], types: [] });

        // Handle setting universal filters in other marketplaces (if relevant)
        setOrganizationFilters({...organizationFilters, conditions: [], genes: []})
        setBiosampleFilters({...biosampleFilters, conditions: [], genes: []})
        setClinicalDatasetFilters({...clinicalDatasetFilters, conditions: [], genes: []})
    }

    const activeCount =
        (filters.conditions?.length || 0) +
        (filters.genes?.length || 0) + 
        (filters.types?.length || 0);

    const handleAsyncGeneSearch = async (query: string): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input
        
        try {
            const response = await fetch(`/api/genes?search=${query}`);
            const data = await response.json();

            // Return the fetched options
            return data;
        } catch (error) {
            console.error("Failed to fetch genes:", error);
            return [];
        }
    };

    const handleAsyncConditionSearch = async (query: string): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input
        
        try {
            const response = await fetch(`/api/conditions?search=${query}`);
            const data = await response.json();

            // Return the fetched options
            return data;
        } catch (error) {
            console.error("Failed to fetch genes:", error);
            return [];
        }
    };

    return (
        <div className="w-full mx-auto flex flex-col gap-y-2">
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm">
                {/* Search input */}
                <div className="flex-1 px-6 py-4">
                    <Label className="text-base font-semibold text-gray-900">Search</Label>
                    <Input
                        type="text"
                        placeholder="Search types, genes..."
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const search: string = e.target.value
                            setQuery(search)
                            debounceHandleInputChange(search)
                        }}
                        className="border-0 p-0 text-sm text-gray-600 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                <Separator orientation="vertical" className="h-8 hidden lg:block"/>

                {/* Conditions */}
                <div className="flex-1 px-6 py-4 min-w-[100px] hidden lg:block">
                    <Label className="text-base font-semibold text-gray-900">Condition</Label>
                    <MultipleSelector
                        value={filters.conditions ?? []}
                        onChange={(vals) => setFilterKey("conditions", vals)}
                        onSearch={handleAsyncConditionSearch}
                        placeholder="Any condition"
                        hidePlaceholderWhenSelected
                        className="mt-1 border-0 px-0 py-0"
                        commandProps={{className: "bg-transparent"}}
                        loadingIndicator={<p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading conditions...</p>}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                        }
                        showCountInsteadOfSelected={true}
                        showBadgesInDropdown={true}
                        showHoverCard={false}
                    />
                </div>

                <Separator orientation="vertical" className="h-8 hidden lg:block"/>

                {/* Genes */}
                <div className="flex-1 px-6 py-4 min-w-[100px] hidden lg:block">
                    <Label className="text-base font-semibold text-gray-900">Gene</Label>
                    <MultipleSelector
                        value={filters.genes ?? []}
                        onChange={(vals) => setFilterKey("genes", vals)}
                        onSearch={handleAsyncGeneSearch}
                        placeholder="Any gene"
                        hidePlaceholderWhenSelected
                        className="mt-1 border-0 px-0 py-0"
                        commandProps={{className: "bg-transparent"}}
                        loadingIndicator={<p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading genes...</p>}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                        }
                        showCountInsteadOfSelected={true}
                        showBadgesInDropdown={true}
                        showHoverCard={false}
                    />
                </div>

                <Separator orientation="vertical" className="h-8" />

                {/* Mobile and additional filters */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="m-4 rounded-full" size="icon" variant={'cta'}>
                            <Funnel />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Disease Model Filters</DialogTitle>
                        {/* Conditions */}
                        <div>
                            <Label className="text-base font-semibold text-gray-900">Condition</Label>
                            <MultipleSelector
                                value={filters.conditions ?? []}
                                onChange={(vals) => setFilterKey("conditions", vals)}
                                onSearch={handleAsyncConditionSearch}
                                placeholder="Select conditions..."
                                hidePlaceholderWhenSelected
                                commandProps={{className: "bg-transparent"}}
                                loadingIndicator={<p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading conditions...</p>}
                                emptyIndicator={
                                    <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                }
                                showHoverCard={false}
                            />
                        </div>

                        {/* Genes */}
                        <div>
                            <Label className="text-base font-semibold text-gray-900">Gene</Label>
                            <MultipleSelector
                                value={filters.genes ?? []}
                                onChange={(vals) => setFilterKey("genes", vals)}
                                onSearch={handleAsyncGeneSearch}
                                placeholder="Select genes..."
                                hidePlaceholderWhenSelected
                                commandProps={{className: "bg-transparent"}}
                                loadingIndicator={<p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading genes...</p>}
                                emptyIndicator={
                                    <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                }
                                showHoverCard={false}
                            />
                        </div>

                        {/* Disease Model Types */}
                        <div>
                            <Label className="text-base font-semibold text-gray-900">Disease Model Types</Label>
                            <MultipleSelector
                                value={filters.types ?? []}
                                onChange={(vals) => setFilterKey("types", vals)}
                                defaultOptions={DISEASE_MODEL_TYPE_OPTIONS}
                                placeholder="Select types..."
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
                        {/* conditions */}
                        {(filters.conditions || []).map((item) => (
                            <Badge key={`conditions-${item.value}`} variant="secondary" className="text-xs">
                                {/* {MECHANISM_OPTIONS.find((o) => o.value === item.value)?.label ||
                                    item.value} */}
                                {item.value}
                                <button
                                    onClick={() => removeFilterItem("conditions", item.value)}
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


                        {/* disease model types */}
                        {(filters.types || []).map((item) => (
                            <Badge key={`types-${item.value}`} variant="secondary" className="text-xs">
                                {DISEASE_MODEL_TYPE_OPTIONS.find((o) => o.value === item.value)?.label || item.value}
                                <button
                                    onClick={() => removeFilterItem("types", item.value)}
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
