"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

const categories = [
    "All",
    "Arts & Crafts",
    "Automotive",
    "Baby",
    "Beauty & Personal Care",
    "Books",
    "Computers",
    "Digital Music",
    "Electronics",
    "Kindle Store",
    "Prime Video",
    "Women's Fashion",
    "Men's Fashion",
    "Health & Household"
]

export default function InputDropdown() {
    const [category, setCategory] = React.useState("All")
    const [searchTerm, setSearchTerm] = React.useState("")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        console.log(`Searching for "${searchTerm}" in category "${category}"`)
        // Implement your search logic here
    }

    return (
        <form onSubmit={handleSearch} className="flex w-full max-w-3xl mx-auto">
            <div className="flex-grow">
                <Input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="rounded-l-md rounded-none border-r-0"
                />
            </div>
            <div className="flex-shrink-0">
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[180px] rounded-none border-x-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="absolute inset-0 z-0 pointer-events-none before:absolute before:inset-x-1/4 before:top-0 before:w-1/2 before:border-t-2 before:border-gray-300 after:absolute after:inset-x-1/4 after:bottom-0 after:w-1/2 after:border-b-2 after:border-gray-300"></span>
            </div>
            <div className="flex-shrink-0">
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[180px] rounded-none border-l-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span className="absolute inset-0 z-0 pointer-events-none before:absolute before:inset-x-1/4 before:top-0 before:w-1/2 before:border-t-2 before:border-gray-300 after:absolute after:inset-x-1/4 after:bottom-0 after:w-1/2 after:border-b-2 after:border-gray-300"></span>
            </div>
            <Button type="submit" className="rounded-r-md rounded-none">
                <Search className="h-4 w-4" />
            </Button>
        </form>
    )
}
