"use client"

import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import {Funnel, X} from "lucide-react"
import {useShallow} from "zustand/react/shallow"
import {MILESTONE_TYPE_OPTIONS_WITH_VALUE} from "~web/components/marketplace/service-providers/cro-filters";
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
} from "@comend/lib/types"
import {debounce} from "lodash";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";

export function ProviderMarketplaceIntegratedSearchAndFilter() {
    const {searchTerm, sortBy, setSortBy, setSearchTerm, filters, setFilters, totalResults} = useCROSearchStore(
        useShallow((state: CROSearchState) => ({
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

    const clearAllFilters = () =>
        setFilters({...filters, milestoneTypes: [], types: [], certifications: [], tags: [], categories: []})

    // helper to update a single filter key from MultipleSelector
    const setFilterKey = (key: keyof typeof filters, value: { label: string; value: string }[]) =>
        setFilters({...filters, [key]: value})

    const removeFilterItem = (key: keyof typeof filters, value: string) =>
        setFilters({...filters, [key]: (filters[key] || []).filter((i) => i.value !== value)})

    // keep searchTerm input in sync if the store changes elsewhere
    useEffect(() => setQuery(searchTerm), [searchTerm])

    // useEffect(() => {
    //     const parsedCROFilters = {
    //         categories: [] as any[],
    //         milestoneTypes: [] as any[],
    //         types: [] as any[],
    //         certifications: [] as any[],
    //         tags: [] as any[],
    //     }
    //     initializeCROSearch(parsedCROFilters)
    //     console.log(`CRO search initialized...`)
    //     setSearchTerm("") // initial fetch on page load
    // }, [])

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
                        placeholder="CROs, services, locations..."
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const search: string = e.target.value
                            setQuery(search)
                            debounceHandleInputChange(search)
                        }}
                        className="border-0 p-0 text-sm text-gray-600 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                {/* <Separator orientation="vertical" className="h-8 hidden lg:block"/> */}

                {/* Project Types */}
                {/* <div className="flex-1 px-6 py-4 min-w-[100px] hidden lg:block">
                    <Label className="text-base font-semibold text-gray-900">Project Types</Label>
                    <MultipleSelector
                        value={filters.milestoneTypes}
                        onChange={(vals) => setFilterKey("milestoneTypes", vals)}
                        defaultOptions={MILESTONE_TYPE_OPTIONS_WITH_VALUE}
                        placeholder="Any project types"
                        hidePlaceholderWhenSelected
                        className="mt-1 border-0 px-0 py-0"
                        commandProps={{className: "bg-transparent"}}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results
                                found.</p>
                        }
                        showCountInsteadOfSelected={true}
                        showBadgesInDropdown={true}
                    />
                </div> */}

                {/* <Separator orientation="vertical" className="h-8 hidden lg:block"/> */}

                {/* Business Types */}
                {/* <div className="flex-1 px-6 py-4 min-w-[100px] hidden lg:block">
                    <Label className="text-base font-semibold text-gray-900">Business Types</Label>
                    <MultipleSelector
                        value={filters.types}
                        onChange={(vals) => setFilterKey("types", vals)}
                        defaultOptions={BUSINESS_TYPES}
                        placeholder="Any business types"
                        hidePlaceholderWhenSelected
                        className="mt-1 border-0 px-0 py-0"
                        commandProps={{className: "bg-transparent"}}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results
                                found.</p>
                        }
                        showCountInsteadOfSelected={true}
                        showBadgesInDropdown={true}
                    />
                </div> */}

                {/* <Separator orientation="vertical" className="h-8 hidden lg:block"/> */}

                {/* Certifications */}
                {/* <div className="flex-1 px-6 py-4 min-w-[100px] hidden lg:block">
                    <Label className="text-base font-semibold text-gray-900">Certifications</Label>
                    <MultipleSelector
                        value={filters.certifications}
                        onChange={(vals) => setFilterKey("certifications", vals)}
                        defaultOptions={CRO_CERTIFICATIONS}
                        placeholder="Any certifications"
                        hidePlaceholderWhenSelected
                        className="mt-1 border-0 px-0 py-0"
                        commandProps={{className: "bg-transparent"}}
                        emptyIndicator={
                            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results
                                found.</p>
                        }
                        showCountInsteadOfSelected={true}
                        showBadgesInDropdown={true}
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
                        <DialogTitle>Service provider filters</DialogTitle>
                            {/* Project Types */}
                            <div>
                                <Label>Project types</Label>
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
                            </div>

                            {/* Business Types */}
                            <div>
                                <Label>Business types</Label>
                                <MultipleSelector
                                    value={filters.types}
                                    onChange={(vals) => setFilterKey("types", vals)}
                                    defaultOptions={BUSINESS_TYPES}
                                    placeholder="Select business types..."
                                    hidePlaceholderWhenSelected
                                    commandProps={{className: "bg-transparent"}}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                    }
                                />
                            </div>

                            {/* Certifications */}
                            <div>
                                <Label>Certifications</Label>
                                <MultipleSelector
                                    value={filters.certifications}
                                    onChange={(vals) => setFilterKey("certifications", vals)}
                                    defaultOptions={CRO_CERTIFICATIONS}
                                    placeholder="Select certifications..."
                                    hidePlaceholderWhenSelected
                                    commandProps={{className: "bg-transparent"}}
                                    emptyIndicator={
                                        <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results found.</p>
                                    }
                                />
                            </div>
                    </DialogContent>
                </Dialog>

                {/*/!* Specialties / Tags *!/*/}
                {/*<div className="flex-1 px-6 py-4 min-w-[100px]">*/}
                {/*    <Label className="text-base font-semibold text-gray-900">Specialties</Label>*/}
                {/*    <MultipleSelector*/}
                {/*        value={filters.tags}*/}
                {/*        onChange={(vals) => setFilterKey("tags", vals)}*/}
                {/*        defaultOptions={CRO_TAGS}*/}
                {/*        placeholder="Any"*/}
                {/*        hidePlaceholderWhenSelected*/}
                {/*        className="mt-1 border-0 px-0 py-0"*/}
                {/*        commandProps={{className: "bg-transparent"}}*/}
                {/*        emptyIndicator={*/}
                {/*            <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">no results*/}
                {/*                found.</p>*/}
                {/*        }*/}
                {/*        showCountInsteadOfSelected={true}*/}
                {/*        showBadgesInDropdown={true}*/}
                {/*    />*/}
                {/*</div>*/}
            </div>

            <div className="flex flex-row gap-2 items-center">
                {/* Active Filter Badges (kept the same) */}
                {(filters.milestoneTypes.length ||
                    filters.types.length ||
                    filters.certifications.length ||
                    filters.tags.length) > 0 && (
                    <div className="flex flex-wrap gap-2 items-center">
                        {[
                            {key: "milestoneTypes", options: MILESTONE_TYPE_OPTIONS_WITH_VALUE},
                            {key: "types", options: BUSINESS_TYPES},
                            {key: "certifications", options: CRO_CERTIFICATIONS},
                            {key: "tags", options: CRO_TAGS},
                        ]
                            .flatMap(({key, options}) =>
                                // @ts-ignore — keys align with FiltersType
                                (filters[key] || []).map((item: { value: string }) => (
                                    <Badge key={`${key}-${item.value}`} variant="secondary" className="text-xs">
                                        {options.find((opt) => opt.value === item.value)?.label || item.value}
                                        <button
                                            onClick={() => removeFilterItem(key as any, item.value)}
                                            className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
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
            </div>

            <div className="w-full flex flex-row justify-between items-center">
                {/* Result Count */}
                <div className="mt-2 text-sm text-muted-foreground">
                    {typeof totalResults === "number" ? `${totalResults} results` : "Loading results..."}
                </div>
                <Select
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
                </Select>
            </div>
        </div>
    )
}
