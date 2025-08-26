"use client"

import * as React from "react";
import Image from "next/image"
import { NewToolDialog } from "./edit-tool-dialog"
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { DiseaseModelsTable } from "@comend/components/biorepo/advanced-data-table/disease-models-table/private-disease-models-table"
import { FeatureFlagsProvider } from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { Shell } from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import { useDiseaseModelsTableColumns } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/private-disease-models-table-columns";
import { Tool } from "@prisma/client";
import { SearchParams } from "typesense/lib/Typesense/Documents";
import { useEffect } from "react";
import { revalidate } from "@/packages/lib/revalidate";

export const PrivateDiseaseModelToolsPage = ({data, pageCount, searchParams}: {data: Tool[], pageCount: number, searchParams: SearchParams}) => {
    const columns = useDiseaseModelsTableColumns()

    // useEffect(() => {
    //     revalidate('/')
    // }, [])

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <Shell className="gap-2">
            <FeatureFlagsProvider
                additionalButtons={(
                    <>
                        {/* <BiosampleBulkImportDialog/> */}
                        <NewToolDialog type={"diseaseModel"}/>
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
                    <DiseaseModelsTable data={data} pageCount={pageCount} columns={columns} searchParams={searchParams}/>
                </React.Suspense>
            </FeatureFlagsProvider>
        </Shell>
        </main>
    )
}
