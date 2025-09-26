"use client";

import * as React from "react";
import { TooltipProvider } from "@comend/components/ui/tooltip";
import { Skeleton } from "@comend/components/ui/skeleton";
import { useLoadingTimeout } from "~web/hooks/useLoadingTimeout";

function MembersTableSkeleton() {
    return (
        <div className="w-full p-4">
            {/* Section header */}
            <div className="sm:flex sm:items-center">
                <div className="space-y-2 sm:flex-auto">
                    <Skeleton className="h-6 w-28" /> {/* "Members" */}
                    <Skeleton className="h-4 w-64" /> {/* subtitle */}
                </div>
            </div>

            {/* Table */}
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                    <Skeleton className="h-4 w-16" />
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    <Skeleton className="h-4 w-12" />
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    <Skeleton className="h-4 w-10" />
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    <Skeleton className="h-4 w-12" />
                                </th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 bg-white">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <tr key={`member-skel-${i}`}>
                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                        <div className="flex items-center">
                                            <div className="h-11 w-11 flex-shrink-0">
                                                <Skeleton className="h-11 w-11 rounded-full" />
                                            </div>
                                            <div className="ml-4 space-y-2">
                                                <Skeleton className="h-4 w-40" /> {/* name */}
                                                <Skeleton className="h-3 w-56" /> {/* email */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        <Skeleton className="h-4 w-24" /> {/* title */}
                                    </td>
                                    <td className="capitalize whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        <Skeleton className="h-4 w-20" /> {/* role */}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        <Skeleton className="h-4 w-28" /> {/* joined */}
                                    </td>
                                    <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <Skeleton className="h-8 w-8 rounded-md ml-auto" /> {/* menu button */}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InvitationsTableSkeleton() {
    return (
        <div className="w-full p-4">
            {/* Section header + right-side action button */}
            <div className="sm:flex sm:items-center">
                <div className="space-y-2 sm:flex-auto">
                    <Skeleton className="h-6 w-32" /> {/* "Invitations" */}
                    <Skeleton className="h-4 w-72" /> {/* subtitle */}
                </div>
                <div className="mt-4 sm:mt-0">
                    <Skeleton className="h-9 w-40 rounded-md" /> {/* InviteUserToOrgDialog trigger */}
                </div>
            </div>

            {/* Table */}
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                    <Skeleton className="h-4 w-14" />
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    <Skeleton className="h-4 w-10" />
                                </th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    <Skeleton className="h-4 w-14" />
                                </th>
                                <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 bg-white">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <tr key={`invite-skel-${i}`}>
                                    <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                        <div className="flex items-center">
                                            <div className="h-11 w-11 flex-shrink-0">
                                                <Skeleton className="h-11 w-11 rounded-full" />
                                            </div>
                                            <div className="ml-4">
                                                <Skeleton className="h-4 w-56" /> {/* email */}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="capitalize whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        <Skeleton className="h-4 w-24" /> {/* role */}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                                        <Skeleton className="h-4 w-28" /> {/* invited date */}
                                    </td>
                                    <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                        <Skeleton className="h-8 w-8 rounded-md ml-auto" /> {/* actions */}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Loading() {
    // Optional: fade the skeleton if load completes almost instantly
    useLoadingTimeout(5000);

    return (
        <TooltipProvider>
            <div className="flex flex-col space-y-4 justify-start items-start w-full h-full max-w-7xl mx-auto p-8">
                <MembersTableSkeleton />
                <InvitationsTableSkeleton />
            </div>
        </TooltipProvider>
    );
}
