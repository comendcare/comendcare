"use client"

import RequestCard from "~researcher/components/request-card";
import {useRequestSearchStore} from "@/state/search/requestSearchStore";
import {MaterialAndDataAccessRequest} from "@prisma/client";
import { useEffect } from "react";
import { getRequests } from "comend-researcher-hub/lib/fetchers";

export default function RequestHistory() {
    const {
        searchResults,
        totalResults,
        setSearchResults,
        setTotalResults,
        filters,
        sortBy,
        initialized,
        initState
    } = useRequestSearchStore();

    // Load data on first mount
    useEffect(() => {
        const loadInitial = async () => {
            if (!initialized) {
                initState(filters); // Set initialized to true and filters to default
                const response = await getRequests({
                    searchTerm: '',
                    filters,
                    sortBy,
                    page: 1,
                });
                setSearchResults(response.data);
                setTotalResults(response.total);
            }
        };
        loadInitial();
    }, [initialized, filters, sortBy, setSearchResults, setTotalResults, initState]);

    return (
        <>
            {searchResults && searchResults.length > 0 ? (
                <div className="space-y-4">
                    {searchResults.map((request: MaterialAndDataAccessRequest) => (
                        <RequestCard request={request} key={request.id}/>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">There are no search results</div>
            )}
        </>
    );
}
