"use client"

import React, {useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {CROSearchState, useOrganizationSearchStore, ViewType} from "@/state/search/organizationSearchStore";
import {useShallow} from "zustand/react/shallow"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "./ui/select";

const selector = (state: CROSearchState) => ({
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
    } = useOrganizationSearchStore(useShallow(selector))

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
                        {/* <SelectItem value="patients-low-high">Patients (Low-High)</SelectItem>
                        <SelectItem value="patients-high-low">Patients (High-Low)</SelectItem>
                        <SelectItem value="prevalence-low-high">Prevalence (Low-High)</SelectItem>
                        <SelectItem value="prevalence-high-low">Prevalence (High-Low)</SelectItem> */}
                        <SelectItem value="money-raised-low-high">$ Raised (Low-High)</SelectItem>
                        <SelectItem value="money-raised-high-low">$ Raised (High-Low)</SelectItem>
                        <SelectItem value="money-deployed-low-high">$ Deployed (Low-High)</SelectItem>
                        <SelectItem value="money-deployed-high-low">$ Deployed (High-Low)</SelectItem>
                        <SelectItem value="patients-engaged-low-hight">Patients engaged (Low-High)</SelectItem>
                        <SelectItem value="patients-engaged-high-low">Patients engaged (High-Low)</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            <Select
                onValueChange={(view: string) => {
                    setView(view as ViewType)
                }}
                defaultValue={view}
            >
                <SelectTrigger className="w-[150px] h-full">
                    <SelectValue placeholder="View"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="grid">Grid View</SelectItem>
                        <SelectItem value="list">List View</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
