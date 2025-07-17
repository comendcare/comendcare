"use client"

import * as React from "react";
import Image from "next/image"
import { NewToolDialog } from "./edit-tool-dialog"
import { AssetBulkImportDialog } from "./asset-bulk-import-dialog"
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { BiosamplesTable } from "@comend/components/biorepo/advanced-data-table/biosamples-table/biosamples-table"
import { FeatureFlagsProvider } from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { Shell } from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import { getBiosamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/private-biosamples-table-columns";
import { getBiosamples } from "@/packages/components/biorepo/advanced-data-table/lib/queries";

export const PrivateBiosampleToolsPage = ({data, pageCount}: {data: any, pageCount: number}) => {
    const columns = getBiosamplesTableColumns()
    // const [{ data }] = React.use(promises);

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <div className="flex gap-2 w-full justify-end">
            <NewToolDialog iconOnly={true} numAssetsPinned={0} type={"biosample"}/>
            <AssetBulkImportDialog />
        </div>
        {data.length <= 0 
            ? (
                <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                    <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                        <h1 className="font-cal text-4xl">You do not have any Biosample Tools</h1>
                        <Image
                            alt="No Biosample Tools"
                            src="https://illustrations.popsy.co/gray/graphic-design.svg"
                            width={300}
                            height={300}
                        />
                        <p className="text-lg text-stone-500">
                            A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                        </p>
                        <NewToolDialog numAssetsPinned={0} type={"biosample"}/>
                    </div>
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
                            <BiosamplesTable data={data} pageCount={pageCount} columns={columns}/>
                        </React.Suspense>
                    </FeatureFlagsProvider>
                </Shell>
            )}
        </main>
    )
}
