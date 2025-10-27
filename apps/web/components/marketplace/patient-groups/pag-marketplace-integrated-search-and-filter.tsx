"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Funnel, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { debounce } from "lodash";

import { Button } from "@comend/components/ui/button";
import { Input } from "@comend/components/ui/input";
import { Label } from "@comend/components/ui/label";
import { Badge } from "@comend/components/ui/badge";
import { Separator } from "@comend/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@comend/components/ui/select";
import MultipleSelector from "@comend/components/ui/multiple-selector";

import type { OrganizationSearchState } from "@/state/search/organizationSearchStore";
import { useOrganizationSearchStore } from "@/state/search/organizationSearchStore";

// Options
import {mechanisms} from "@comend/lib/types";
import { ASSOCIATED_SYSTEMS, MODALITIES } from "@comend/lib/types";
import { Dialog, DialogContent, DialogTrigger } from "@/packages/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import type { Option } from "@comend/lib/types";
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore";
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore";
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore";
import { initializeOrganizationSearch } from "@/packages/lib/initialize-client-state";

// Helpers to normalize options
const MECHANISM_OPTIONS = mechanisms.map((m: any) => ({
    label: m.label ?? m.name ?? String(m.id),
    value: String(m.id),
}));

// Sort menu (mirrors store-supported sort keys)
const SORT_ITEMS: { value: string; label: string }[] = [
    { value: "recently-updated", label: "Recently Updated" },
    { value: "alphabetical", label: "Alphabetical (A-Z)" },
    { value: "money-raised-low-high", label: "$ Raised (Low-High)" },
    { value: "money-raised-high-low", label: "$ Raised (High-Low)" },
    { value: "money-deployed-low-high", label: "$ Deployed (Low-High)" },
    { value: "money-deployed-high-low", label: "$ Deployed (High-Low)" },
    { value: "patients-engaged-low-high", label: "Patients engaged (Low-High)" },
    { value: "patients-engaged-high-low", label: "Patients engaged (High-Low)" },
];

export default function PAGMarketplaceIntegratedSearchAndFilter() {
    const {
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        filters,
        setFilters,
        totalResults,
    } = useOrganizationSearchStore(
        useShallow((state: OrganizationSearchState) => ({
            searchTerm: state.searchTerm,
            setSearchTerm: state.setSearchTerm,
            sortBy: state.sortBy,
            setSortBy: state.setSortBy,
            filters: state.filters,
            setFilters: state.setFilters,
            totalResults: state.totalResults,
        }))
    );
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
        setFilters: setDiseaseModelFilters,
        filters: diseaseModelFilters,
        setSearchTerm: setDiseaseModelSearchTerm
    } = useDiseaseModelSearchStore(
        useShallow((state: DiseaseModelSearchState) => ({
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
    const dialogRef = useRef<HTMLDivElement>(null)


    const [query, setQuery] = useState(searchTerm);

    // Keep local input in sync with store (e.g., external changes)
    useEffect(() => setQuery(searchTerm), [searchTerm]);

    // // initial fetch on mount
    // useEffect(() => {
    //     // init organization/PAG search store
    //     const parsedPAGFilters = {
    //         genes: [] as any[],
    //         conditions: [] as any[],
    //         systems: [] as any[],
    //         mechanisms: [] as any[],
    //         modalities: [] as any[],
    //     }
    //     initializeOrganizationSearch(parsedPAGFilters)
    //     console.log(`Organization search initialized...`)
    //     // reset to trigger initial load using store's logic
    //     // setSearchTerm("");
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    const handleInputChangeCallback = useCallback(
        (text: string) => {
            setSearchTerm(text);
            
            // Handle setting universal search in other marketplaces
            setBiosampleSearchTerm(text);
            setDiseaseModelSearchTerm(text);
            setClinicalDatasetSearchTerm(text);
        },
        [setSearchTerm]
    );

    const debounceHandleInputChange = useMemo(
        () => debounce(handleInputChangeCallback, 500),
        [handleInputChangeCallback]
    );

    // helper to update a single filter key from MultipleSelector
    const setFilterKey = (key: keyof typeof filters, value: { label: string; value: string }[]) => {
        setFilters({...filters, [key]: value})

        // Handle setting universal filters in other marketplaces (if relevant)
        if (key === 'conditions' || key === 'genes') {
            setBiosampleFilters({...biosampleFilters, [key]: value})
            setDiseaseModelFilters({...diseaseModelFilters, [key]: value})
            setClinicalDatasetFilters({...clinicalDatasetFilters, [key]: value})
        }
    }

    const removeFilterItem = (key: keyof typeof filters, value: string) => {
        setFilters({...filters, [key]: (filters[key] || []).filter((i) => i.value !== value)})

        // Handle setting universal filters in other marketplaces (if relevant)
        if (key === 'conditions' || key === 'genes') {
            setBiosampleFilters({...biosampleFilters, [key]: (biosampleFilters[key] || []).filter((i) => i.value !== value)})
            setDiseaseModelFilters({...diseaseModelFilters, [key]: (diseaseModelFilters[key] || []).filter((i) => i.value !== value)})
            setClinicalDatasetFilters({...clinicalDatasetFilters, [key]: (clinicalDatasetFilters[key] || []).filter((i) => i.value !== value)})
        }
    }

    const clearAll = () => {
        setFilters({ ...filters, conditions: [], genes: [], mechanisms: [], systems: [], modalities: [] });

        // Handle setting universal filters in other marketplaces (if relevant)
        setBiosampleFilters({...biosampleFilters, conditions: [], genes: []})
        setDiseaseModelFilters({...diseaseModelFilters, conditions: [], genes: []})
        setClinicalDatasetFilters({...clinicalDatasetFilters, conditions: [], genes: []})
    }

    // map to find labels for badges
    const SYSTEM_OPTIONS = ASSOCIATED_SYSTEMS;
    const MODALITY_OPTIONS = MODALITIES;

    const activeCount =
        (filters.conditions?.length || 0) +
        (filters.genes?.length || 0) + 
        (filters.mechanisms?.length || 0) +
        (filters.systems?.length || 0) +
        (filters.modalities?.length || 0);


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
            {/* Top search + three filters */}
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm">
                {/* Search */}
                <div className="flex-1 px-6 py-4">
                    <Label className="text-base font-semibold text-gray-900">Search</Label>
                    <Input
                        type="text"
                        placeholder="Organizations, descriptions..."
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const text = e.target.value;
                            setQuery(text);
                            debounceHandleInputChange(text);
                        }}
                        className="border-0 p-0 text-sm text-gray-600 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                {/* <Separator orientation="vertical" className="h-8 hidden lg:block"/> */}

                {/* Conditions */}
                {/* <div className="flex-1 px-6 py-4 min-w-[100px] hidden lg:block">
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
                </div> */}

                {/* <Separator orientation="vertical" className="h-8 hidden lg:block"/> */}

                {/* Genes */}
                {/* <div className="flex-1 px-6 py-4 min-w-[100px] hidden lg:block">
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
                </div> */}

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
                        <DialogTitle>Patient group filters</DialogTitle>
                            {/* Conditions */}
                            <div>
                                <Label>Condition</Label>
                                <MultipleSelector
                                    value={filters.conditions ?? []}
                                    onChange={(vals) => setFilterKey("conditions", vals)}
                                    onSearch={handleAsyncConditionSearch}
                                    placeholder="Any condition"
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
                                <Label>Gene</Label>
                                <MultipleSelector
                                    value={filters.genes ?? []}
                                    onChange={(vals) => setFilterKey("genes", vals)}
                                    onSearch={handleAsyncGeneSearch}
                                    placeholder="Any gene"
                                    hidePlaceholderWhenSelected
                                    commandProps={{className: "bg-transparent"}}
                                    loadingIndicator={<p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">Loading genes...</p>}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                    }
                                    showHoverCard={false}
                                />
                            </div>

                            {/* Mechanisms of action */}
                            <div>
                                <Label>
                                    Mechanisms of action
                                </Label>
                                <MultipleSelector
                                    value={filters.mechanisms ?? []}
                                    onChange={(vals) => setFilterKey("mechanisms", vals)}
                                    defaultOptions={MECHANISM_OPTIONS}
                                    placeholder="Any"
                                    hidePlaceholderWhenSelected
                                    commandProps={{ className: "bg-transparent" }}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                    showHoverCard={false}
                                />
                            </div>

                            {/* Associated systems */}
                            <div>
                                <Label>
                                    Associated systems
                                </Label>
                                <MultipleSelector
                                    value={filters.systems ?? []}
                                    onChange={(vals) => setFilterKey("systems", vals)}
                                    defaultOptions={SYSTEM_OPTIONS}
                                    placeholder="Any"
                                    hidePlaceholderWhenSelected
                                    commandProps={{ className: "bg-transparent" }}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
                                />
                            </div>

                            {/* Modalities */}
                            <div>
                                <Label>
                                    Modalities of interest
                                </Label>
                                <MultipleSelector
                                    value={filters.modalities ?? []}
                                    onChange={(vals) => setFilterKey("modalities", vals)}
                                    defaultOptions={MODALITY_OPTIONS}
                                    placeholder="Any"
                                    hidePlaceholderWhenSelected
                                    commandProps={{ className: "bg-transparent" }}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                                            no results found.
                                        </p>
                                    }
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

                        {/* mechanisms */}
                        {(filters.mechanisms || []).map((item) => (
                            <Badge key={`mechanisms-${item.value}`} variant="secondary" className="text-xs">
                                {MECHANISM_OPTIONS.find((o) => o.value === item.value)?.label ||
                                    item.value}
                                <button
                                    onClick={() => removeFilterItem("mechanisms", item.value)}
                                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}

                        {/* systems */}
                        {(filters.systems || []).map((item) => (
                            <Badge key={`systems-${item.value}`} variant="secondary" className="text-xs">
                                {SYSTEM_OPTIONS.find((o: any) => o.value === item.value)?.label ||
                                    item.value}
                                <button
                                    onClick={() => removeFilterItem("systems", item.value)}
                                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}

                        {/* modalities */}
                        {(filters.modalities || []).map((item) => (
                            <Badge key={`modalities-${item.value}`} variant="secondary" className="text-xs">
                                {MODALITY_OPTIONS.find((o: any) => o.value === item.value)?.label ||
                                    item.value}
                                <button
                                    onClick={() => removeFilterItem("modalities", item.value)}
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

            {/* Footer: total + sort */}
            <div className="w-full flex flex-row justify-between items-center">
                <div className="mt-2 text-sm text-muted-foreground">
                    {typeof totalResults === "number"
                        ? `${totalResults} results`
                        : "Loading results..."}
                </div>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                    <SelectTrigger className="w-[200px] h-full text-xs">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                        <SelectGroup className="text-xs">
                            {SORT_ITEMS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
