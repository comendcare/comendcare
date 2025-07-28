"use client"

import * as React from "react";
import Image from "next/image"
import { NewToolDialog } from "./edit-tool-dialog"
import { AssetBulkImportDialog } from "./asset-bulk-import-dialog"
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { FeatureFlagsProvider } from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { Shell } from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import { getDatasamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/datasamples-table/datasamples-table-columns";
import { DatasamplesTable } from "@comend/components/biorepo/advanced-data-table/datasamples-table/datasamples-table"
import { getDatasamples } from "@/packages/components/biorepo/advanced-data-table/lib/queries";
import { Tool } from "@prisma/client";

export const PrivateDatasampleToolsPage = ({data, pageCount}: {data: Tool[], pageCount: number}) => {
    const columns = getDatasamplesTableColumns()

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <Shell className="gap-2">
            <FeatureFlagsProvider
                additionalButtons={(
                    <>
                        <NewToolDialog iconOnly={true} numAssetsPinned={0} type={"data"}/>
                        <AssetBulkImportDialog />
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
                    <DatasamplesTable data={data} pageCount={pageCount} columns={columns}/>
                </React.Suspense>
            </FeatureFlagsProvider>
        </Shell>
        </main>
    )
}