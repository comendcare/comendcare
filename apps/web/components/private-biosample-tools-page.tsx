"use client"

import * as React from "react";
import Image from "next/image"
import { NewToolDialog } from "./edit-tool-dialog"
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { BiosamplesTable } from "@comend/components/biorepo/advanced-data-table/biosamples-table/biosamples-table"
import { FeatureFlagsProvider } from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { Shell } from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import { useBiosamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/private-biosamples-table-columns";
import { Tool } from "@prisma/client";
import { BiosampleBulkImportDialog } from "./biosample-bulk-import-dialog";
import { SearchParams } from "@/packages/components/types";
import { useEffect } from "react";
import { revalidate } from "@/packages/lib/revalidate";

export const PrivateBiosampleToolsPage = ({data, pageCount, searchParams}: {data: Tool[], pageCount: number, searchParams: SearchParams}) => {
    const columns = useBiosamplesTableColumns()

    useEffect(() => {
        revalidate('/')
    }, [])

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <Shell className="gap-2">
            <FeatureFlagsProvider
                additionalButtons={(
                    <>
                        <BiosampleBulkImportDialog/>
                        <NewToolDialog numAssetsPinned={0} type={"biosample"}/>
                    </>
                )}
            >
                <React.Suspense
                    fallback={
                        <DataTableSkeleton
                            columnCount={7}
                            filterCount={2}
                            cellWidths={[
                                "10rem",
                                "30rem",
                                "10rem",
                                "10rem",
                                "6rem",
                                "6rem",
                                "6rem",
                            ]}
                            shrinkZero
                        />
                    }
                >
                    {/* <div className="absolute h-full w-full bg-blue-dark opacity-50" /> */}
                    <BiosamplesTable data={data} pageCount={pageCount} columns={columns} searchParams={searchParams}/>
                </React.Suspense>
            </FeatureFlagsProvider>
        </Shell>
        </main>
    )
}
