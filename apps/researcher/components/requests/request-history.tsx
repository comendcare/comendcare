"use client"

import {useRequestSearchStore} from "./../../../../state/search/requestSearchStore";
import {MaterialAndDataAccessRequest} from "@prisma/client";
import {useEffect, useState} from "react";
import {Skeleton} from "@comend/components/ui/skeleton";
import {getResearcherRequests} from "@comend/lib/fetchers";
import RequestCard from "@comend/components/requests/request-card";
import {useSession} from "next-auth/react";
import {Button} from "@comend/components/ui/button";
import {useRouter} from "next/navigation";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
} from "@comend/components/ui/pagination" // Add this if not already present

const ITEMS_PER_PAGE = 5;


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

    const {data: session} = useSession()
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil((totalResults ?? 0) / ITEMS_PER_PAGE);

    // Load data on first mount
    useEffect(() => {
        const loadData = async () => {
            if (session?.user?.id && initialized) {
                const response = await getResearcherRequests(
                    session?.user?.id,
                    {
                        searchTerm: '',
                        filters,
                        sortBy,
                        perPage: ITEMS_PER_PAGE,
                        page: currentPage,
                    }
                );
                setSearchResults(response.data);
                setTotalResults(response.total);
            }
        };

        loadData();
    }, [session, currentPage, initialized, filters, sortBy, setSearchResults, setTotalResults]);

    useEffect(() => {
        const loadInitial = async () => {
            if (session?.user?.id && !initialized) {
                initState(filters, 'researcher');
                setCurrentPage(1); // Reset page
            }
        };
        loadInitial();
    }, [session, initialized, filters, initState]);

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
                        <RequestCard request={request} key={request.id} link={`/requests/${request.id}`}/>
                    ))}
                    {totalPages > 1 && (
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                                        }}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }, (_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            href="#"
                                            isActive={currentPage === i + 1}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setCurrentPage(i + 1)
                                            }}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            ) : (
                <div className="flex flex-col space-y-4 justify-center items-center text-center text-gray-500 mt-4">
                    <div className="flex flex-col">
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
