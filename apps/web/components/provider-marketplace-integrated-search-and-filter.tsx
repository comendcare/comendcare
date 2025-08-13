"use client"

import { useEffect, useState } from "react"
import { SearchIcon, FilterIcon, X } from 'lucide-react'
import { cn } from "@comend/lib/utils"
import { useShallow } from "zustand/react/shallow"

import { Button } from "@comend/components/ui/button"
import { Input } from "@comend/components/ui/input"
import { Label } from "@comend/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@comend/components/ui/popover"
import { Badge } from "@comend/components/ui/badge"
import { Separator } from "@comend/components/ui/separator"
import { Checkbox } from "@comend/components/ui/checkbox"
import {useCROSearchStore, CROSearchState} from "@/state/search/croSearchStore";
import {BUSINESS_TYPES, CRO_CERTIFICATIONS, CRO_TAGS, MILESTONE_TYPE_OPTIONS, optionSchema} from "@comend/lib/types"

export const MILESTONE_TYPE_OPTIONS_WITH_VALUE = MILESTONE_TYPE_OPTIONS.map(option => ({
    ...option,
    value: option.id,
}));

export function ProviderMarketplaceIntegratedSearchAndFilter() {
    const {
        searchTerm,
        setSearchTerm,
        filters,
        setFilters,
        totalResults,
    } = useCROSearchStore(
        useShallow((state: CROSearchState) => ({
            searchTerm: state.searchTerm,
            setSearchTerm: state.setSearchTerm,
            filters: state.filters,
            setFilters: state.setFilters,
            totalResults: state.totalResults,
        }))
    )

    const [query, setQuery] = useState(searchTerm)

    const [openPopovers, setOpenPopovers] = useState({
        projectTypes: false,
        businessTypes: false,
        certifications: false,
        tags: false,
    })

    const updateFilter = (key, value) => {
        const current = filters[key] || []
        const exists = current.some(item => item.value === value)
        const updated = exists
            ? current.filter(item => item.value !== value)
            : [...current, { value, label: value }]
        setFilters({ ...filters, [key]: updated })
    }

    const clearFilter = (key) => setFilters({ ...filters, [key]: [] })
    const clearAllFilters = () => setFilters({ ...filters, milestoneTypes: [], types: [], certifications: [], tags: [] })

    const handleSearch = () => setSearchTerm(query)
    const handleKeyPress = (e: React.KeyboardEvent) => e.key === 'Enter' && handleSearch()

    const getFilterCount = (key) => filters[key]?.length || 0
    const getDisplay = (key, options) => {
        const count = getFilterCount(key)
        if (count === 0) return "Any"
        if (count === 1) return options.find(opt => opt.value === filters[key][0]?.value)?.label || "Selected"
        return `${count} selected`
    }

    return (
        <div className={cn("w-full max-w-5xl mx-auto")}>
            <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm">
                <div className="flex-1 px-6 py-4">
                    <Label className="text-xs font-semibold text-gray-900">Search</Label>
                    <Input
                        type="text"
                        placeholder="Search CROs, services, locations..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="border-0 p-0 text-sm text-gray-600 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                <Separator orientation="vertical" className="h-8" />

                {[
                    { key: "milestoneTypes", label: "Project Types", options: MILESTONE_TYPE_OPTIONS_WITH_VALUE },
                    { key: "types", label: "Business Types", options: BUSINESS_TYPES },
                    { key: "certifications", label: "Certifications", options: CRO_CERTIFICATIONS },
                    { key: "tags", label: "Specialties", options: CRO_TAGS },
                ].map(({ key, label, options }) => (
                    <>
                        <Popover
                            key={key}
                            open={openPopovers[key]}
                            onOpenChange={(open) => setOpenPopovers(prev => ({ ...prev, [key]: open }))}
                        >
                            <PopoverTrigger asChild>
                                <div className="flex-1 px-6 py-4 cursor-pointer hover:bg-gray-50 relative">
                                    <Label className="text-xs font-semibold text-gray-900">{label}</Label>
                                    <div className="text-sm text-gray-600 flex items-center justify-between">
                                        <span className="truncate">{getDisplay(key, options)}</span>
                                        {getFilterCount(key) > 0 && (
                                            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                                                {getFilterCount(key)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="start">
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm">{label}</h3>
                                        <Button variant="ghost" size="sm" onClick={() => clearFilter(key)}>Clear</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {options.map(opt => (
                                            <div key={opt.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={opt.id}
                                                    checked={filters[key]?.some(item => item.value === opt.value)}
                                                    onCheckedChange={() => updateFilter(key, opt.value)}
                                                />
                                                <Label htmlFor={opt.id} className="text-sm font-normal cursor-pointer">{opt.label}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Separator orientation="vertical" className="h-8" />
                    </>
                ))}

                <Button
                    onClick={handleSearch}
                    size="icon"
                    className="m-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                    <SearchIcon className="h-4 w-4" />
                </Button>
            </div>

            {/* Active Filter Badges */}
            {(filters.milestoneTypes.length || filters.types.length || filters.certifications.length || filters.tags.length) > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {[
                        { key: "milestoneTypes", options: MILESTONE_TYPE_OPTIONS_WITH_VALUE },
                        { key: "types", options: BUSINESS_TYPES },
                        { key: "certifications", options: CRO_CERTIFICATIONS },
                        { key: "tags", options: CRO_TAGS },
                    ].flatMap(({ key, options }) =>
                        (filters[key] || []).map(item => (
                            <Badge key={item.value} variant="secondary" className="text-xs">
                                {options.find(opt => opt.value === item.value)?.label || item.value}
                                <button
                                    onClick={() => updateFilter(key, item.value)}
                                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))
                    )}
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">Clear all</Button>
                </div>
            )}

            {/* Result Count */}
            <div className="mt-2 text-sm text-muted-foreground">
                {typeof totalResults === "number" ? `${totalResults} results` : "Loading results..."}
            </div>
        </div>
    )
}
