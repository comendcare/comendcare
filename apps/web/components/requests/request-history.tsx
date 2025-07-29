"use client"

import {useRequestSearchStore} from "@/state/search/requestSearchStore";
import {MaterialAndDataAccessRequest} from "@prisma/client";
import {useEffect, useState} from "react";
import { Skeleton } from "@comend/components/ui/skeleton";
import { getOrganizationRequests } from "@/packages/lib/fetchers";
import RequestCard from "@/packages/components/requests/request-card";
import { useSession } from "next-auth/react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink, PaginationNext,
    PaginationPrevious
} from "@/packages/components/ui/pagination";

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
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil((totalResults ?? 0) / ITEMS_PER_PAGE);

    // Load data on first mount
    useEffect(() => {
        const loadInitial = async () => {
            if (session?.user?.organizationId && initialized) {
                initState(filters, 'organization'); // Set initialized to true and filters to default
                const response = await getOrganizationRequests(
                    session?.user?.organizationId,
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
        loadInitial();
    }, [session, initialized, filters, sortBy, setSearchResults, setTotalResults, initState]);

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
                        <RequestCard request={request} key={request.id} link={`/app/requests/${request.id}`}/>
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
                <div className="w-full text-center text-gray-500 mt-4">
                    <p>No requests found.</p>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            )}
        </>
    )
}
