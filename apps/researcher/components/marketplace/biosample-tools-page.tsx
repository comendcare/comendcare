"use client"

import * as React from "react";
import {DataTableSkeleton} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import {DatabaseBiosamplesTable} from "@comend/components/biorepo/advanced-data-table/biosamples-table/database-biosamples-table"
import {FeatureFlagsProvider} from "@comend/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import {Shell} from "@comend/components/biorepo/advanced-data-table/lib/shell";
import {useBiosamplesTableColumns} from "@comend/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns";
import type {Biosample} from "@prisma/client";
import {SearchParams} from "@comend/components/types";
import {useRef, useState} from "react";

export const BiosampleMarketplacePage = ({data, pageCount, searchParams}: {
    data: Biosample[],
    pageCount: number,
    searchParams: SearchParams
}) => {
    const columns = useBiosamplesTableColumns(true, true, false)
    const [rowSelection, setRowSelection] = useState<Object[]>([])
    const parentRef = useRef<HTMLDivElement>(null)

    return (
        <main 
            className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4" 
            ref={parentRef}
        >
            <Shell className="gap-2">
                <FeatureFlagsProvider>
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
                        <DatabaseBiosamplesTable 
                            data={data} 
                            pageCount={pageCount} 
                            columns={columns}
                            searchParams={searchParams}
                            onSelectionChange={setRowSelection}
                            showPagination={true}
                        />
                    </React.Suspense>
                </FeatureFlagsProvider>
            </Shell>
        </main>
    )
}
