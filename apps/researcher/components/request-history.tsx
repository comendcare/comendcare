"use client"

import RequestCard from "~researcher/components/request-card";
import {useRequestSearchStore} from "@/state/search/requestSearchStore";
import {MaterialAndDataAccessRequest} from "@prisma/client";
import {useEffect} from "react";
import {getRequests} from "comend-researcher-hub/lib/fetchers";
import { Skeleton } from "@comend/components/ui/skeleton";
import {Button} from "@comend/components/ui/button";
import { useRouter } from "next/navigation";


export default function RequestHistory() {
    const router = useRouter()
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

    const isLoading = !initialized || searchResults === undefined;

    return (
        <>
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({length: 6}).map((_, i) => (
                        <div
                            key={i}
                            className="border border-border rounded-md p-4 space-y-4 bg-white shadow-sm"
                        >
                            <Skeleton className="h-6 w-1/3"/> {/* title */}
                            <Skeleton className="h-4 w-full"/> {/* body line 1 */}
                            <Skeleton className="h-4 w-5/6"/> {/* body line 2 */}
                            <Skeleton className="h-4 w-2/3"/> {/* body line 3 */}
                            <div className="flex space-x-2 pt-2">
                                <Skeleton className="h-8 w-20 rounded-full"/> {/* tag/button */}
                                <Skeleton className="h-8 w-20 rounded-full"/>
                            </div>
                        </div>
                    ))}
                </div>
            ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                    {searchResults.map((request: MaterialAndDataAccessRequest) => (
                        <RequestCard request={request} key={request.id}/>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col space-y-4 justify-center items-center mx-auto text-center text-gray-500 p-8">
                    <div>
                        <p>No requests found.</p>
                        <p>Try adjusting your filters or search terms.</p>
                    </div>
                    <Button
                        onClick={() => router.push("/toolkit/biosamples")}
                        className="w-min"
                    >
                        Create a request
                    </Button>
                </div>
            )}
        </>
    )
}
