"use client"

import * as React from "react";
import { NewToolDialog } from "./edit-tool-dialog"
import { AssetBulkImportDialog } from "./asset-bulk-import-dialog"
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { FeatureFlagsProvider } from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { Shell } from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import { getClinicalDatasetsTableColumns } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/private-clinical-datasets-table-columns";
import { ClinicalDatasetsTable } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/private-clinical-datasets-table"
import { Tool } from "@prisma/client";
import { SearchParams } from "@/packages/components/types";
import { revalidate } from "@/packages/lib/revalidate";
import { useEffect } from "react";

export const PrivateDatasampleToolsPage = ({data, pageCount, searchParams}: {data: Tool[], pageCount: number, searchParams: SearchParams}) => {
    const columns = getClinicalDatasetsTableColumns()

    // useEffect(() => {
    //     revalidate('/')
    // }, [])

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <Shell className="gap-2">
            <FeatureFlagsProvider
                additionalButtons={(
                    <>
                        <AssetBulkImportDialog />
                        <NewToolDialog type={"data"}/>
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
                    <ClinicalDatasetsTable data={data} pageCount={pageCount} columns={columns} searchParams={searchParams}/>
                </React.Suspense>
            </FeatureFlagsProvider>
        </Shell>
        </main>
    )
}