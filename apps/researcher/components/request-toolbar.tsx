"use client"

import * as React from "react"
import {Input} from "@comend/components/ui/input"
import {Button} from "@comend/components/ui/button"
import {ArrowUpDown, Filter} from "lucide-react"
import {DropdownMenuTrigger} from "@radix-ui/react-dropdown-menu"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@comend/components/ui/dropdown-menu"
import {REQUEST_TYPE_OPTIONS, REQUEST_STATUS_TYPE_OPTIONS} from "@/packages/lib/types"
import {useRequestSearchStore} from "@/state/search/requestSearchStore"

export default function RequestToolbar() {
    const {
        filters,
        setFilters,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy
    } = useRequestSearchStore()

    const toggleType = (typeValue: string) => {
        const isActive = filters.types.some(t => t.value === typeValue)
        const updatedTypes = isActive
            ? filters.types.filter(t => t.value !== typeValue)
            : [...filters.types, REQUEST_TYPE_OPTIONS.find(t => t.value === typeValue)!]

        setFilters({types: updatedTypes})
    }

    const toggleStatus = (statusValue: string) => {
        const isActive = filters.statuses.some(s => s.value === statusValue)
        const updatedStatuses = isActive
            ? filters.statuses.filter(s => s.value !== statusValue)
            : [...filters.statuses, REQUEST_STATUS_TYPE_OPTIONS.find(s => s.value === statusValue)!]

        setFilters({statuses: updatedStatuses})
    }

    const handleSortChange = (value: string) => {
        setSortBy(value)
    }

    return (
        <div className="space-y-4 flex flex-row items-center justify-between">
            <Input
                placeholder="Search requests..."
                className="h-8 w-[150px] lg:w-[250px]"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="flex flex-row items-center space-x-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="ml-auto hidden h-8 lg:flex"
                        >
                            <Filter className="mr-2 h-4 w-4"/>
                            Filter requests
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Types</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        {REQUEST_TYPE_OPTIONS.map(option => (
                            <DropdownMenuCheckboxItem
                                key={option.id}
                                checked={filters.types.some(t => t.value === option.value)}
                                onCheckedChange={() => toggleType(option.value)}
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuLabel>Statuses</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        {REQUEST_STATUS_TYPE_OPTIONS.map(option => (
                            <DropdownMenuCheckboxItem
                                key={option.id}
                                checked={filters.statuses.some(s => s.value === option.value)}
                                onCheckedChange={() => toggleStatus(option.value)}
                            >
                                {option.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto hidden h-8 lg:flex"
                        >
                            <ArrowUpDown className="mr-2 h-4 w-4"/>
                            Sort
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        {[
                            {label: "Recently updated", value: "recently-updated"},
                            {label: "Newest created", value: "newest-created"},
                            {label: "Oldest created", value: "oldest-created"},
                        ].map(sort => (
                            <DropdownMenuItem
                                key={sort.value}
                                className="capitalize"
                                onSelect={() => handleSortChange(sort.value)}
                            >
                                {sort.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
