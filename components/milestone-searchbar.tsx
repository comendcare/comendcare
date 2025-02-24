"use client"

import React, {useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {useShallow} from "zustand/react/shallow"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import {MilestoneSearchState, useMilestoneSearchStore, ViewType} from "@/state/search/milestoneSearchStore";

const selector = (state: MilestoneSearchState) => ({
    setSearchTerm: state.setSearchTerm,
    sortBy: state.sortBy,
    setSortBy: state.setSortBy,
    view: state.view,
    setView: state.setView
})

export default function OrganizationSearchBar() {
    const [query, setQuery] = useState("")
    const {
        setSearchTerm,
        sortBy,
        setSortBy,
        view,
        setView,
    } = useMilestoneSearchStore(useShallow(selector))

    useEffect(() => {
        setSearchTerm("") // initial fetch on page load
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value
        setQuery(search)
        setSearchTerm(search)
    };

    return (
        <div className="w-full h-full flex flex-row gap-4">
            <div className="w-full h-full grow">
                <Input
                    className="w-full h-full"
                    placeholder="Search"
                    value={query}
                    onChange={handleInputChange}
                />
            </div>

            <Select
                value={sortBy}
                onValueChange={(value: string) => {
                    setSortBy(value)
                }}
            >
                <SelectTrigger className="w-[220px] h-full">
                    <SelectValue placeholder="Sort by"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
                        <SelectItem value="last-updated-old-new">Oldest First</SelectItem>
                        <SelectItem value="last-updated-new-old">Newest First</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            {/*<Select*/}
            {/*    onValueChange={(view: string) => {*/}
            {/*        setView(view as ViewType)*/}
            {/*    }}*/}
            {/*    defaultValue={view}*/}
            {/*>*/}
            {/*    <SelectTrigger className="w-[150px] h-full">*/}
            {/*        <SelectValue placeholder="View"/>*/}
            {/*    </SelectTrigger>*/}
            {/*    <SelectContent>*/}
            {/*        <SelectGroup>*/}
            {/*            <SelectItem value="grid">Grid View</SelectItem>*/}
            {/*            <SelectItem value="list">List View</SelectItem>*/}
            {/*        </SelectGroup>*/}
            {/*    </SelectContent>*/}
            {/*</Select>*/}
        </div>
    )
}
