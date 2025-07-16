"use client"

import * as React from "react";
import Image from "next/image"
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { FeatureFlagsProvider } from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { Shell } from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import { BiosampleRequestsTable } from "@/packages/components/biorepo/advanced-data-table/biosample-requests-table/biosample-requests-table"
import { getBiosampleRequestsTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosample-requests-table/biosample-requests-table-columns"
import { getBiosampleRequests } from "@/packages/components/biorepo/advanced-data-table/lib/queries";

export const PrivateBiosampleRequestsPage = ({promises}: {promises: Promise<[Awaited<ReturnType<typeof getBiosampleRequests>>]>}) => {
    const columns = getBiosampleRequestsTableColumns()
    const [{ data }] = React.use(promises);

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        {data.length <= 0 
            ? (
                <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                    <h1 className="font-cal text-4xl">You do not have any Biosample Requests</h1>
                    <Image
                        alt="No Biosample Requests"
                        src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        width={300}
                        height={300}
                    />
                </div>
            )
            : (
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
                            <BiosampleRequestsTable promises={promises} columns={columns}/>
                        </React.Suspense>
                    </FeatureFlagsProvider>
                </Shell>
            )
        }
        </main>
    )
}