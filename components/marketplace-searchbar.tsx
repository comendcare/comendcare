"use client"

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { typesense } from "@/lib/typesense";

export default function MarketplaceSearchBar() {
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [query, setQuery] = useState("");

    const handleSearch = async (searchTerm: string) => {
            if (!searchTerm) {
                setSearchResults([]);
                return;
            }

            try {
                const searchParameters = {
                    q: searchTerm,
                    query_by: "name",
                    // Uncomment the following line if you want results sorted by a field
                    // sort_by: "numberOfIdentifiedPatients:desc",
                };

                const results = await typesense
                    .collections("organizations")
                    .documents()
                    .search(searchParameters);

                setSearchResults(results.hits || []);
            } catch (error) {
                console.error("Search error:", error);
            }
        }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        setQuery(searchTerm);
        handleSearch(searchTerm);
    };

    return (
        <div className="w-1/2 justify-self-center">
            <Input
                className="w-full"
                placeholder="Search"
                value={query}
                onChange={handleInputChange}
            />
            {searchResults.length > 0 && (
                <ul className="search-results">
                    {searchResults.map((result, index) => (
                        <li key={index} className="search-result-item">
                            {result.document.name} {/* Customize as needed */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
