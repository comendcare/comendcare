"use client"

import * as React from "react";
import { NewToolDialog } from "./edit-tool-dialog"
import { AssetBulkImportDialog } from "./asset-bulk-import-dialog"
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { BiosamplesTable } from "@comend/components/biorepo/advanced-data-table/biosamples-table/biosamples-table"
import { getBiosamplesTableColumns } from "./biosample-tool-data-table/biosamples-table-columns";
import { FeatureFlagsProvider } from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { Shell } from "@/packages/components/biorepo/advanced-data-table/lib/shell";

export const PrivateBiosampleToolsPage = ({promises}: {promises: any}) => {
    const columns = getBiosamplesTableColumns()

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <div className="flex gap-2 w-full justify-end">
            <NewToolDialog iconOnly={true} numAssetsPinned={0} type={"biosample"}/>
            <AssetBulkImportDialog />
        </div>

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
                    <BiosamplesTable promises={promises} columns={columns}/>
                </React.Suspense>
            </FeatureFlagsProvider>
        </Shell>
        </main>
    )
}