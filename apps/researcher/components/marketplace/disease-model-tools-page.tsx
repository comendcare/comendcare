"use client"

import * as React from "react";
import {DataTableSkeleton} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import {DatabaseDiseaseModelsTable} from "@comend/components/biorepo/advanced-data-table/disease-models-table/database-disease-models-table"
import {FeatureFlagsProvider} from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import {Shell} from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import {useDiseaseModelsTableColumns} from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns"
import type {DiseaseModel} from "@prisma/client";
import {SearchParams} from "@/packages/components/types";
import {useRef, useState} from "react";

export const DiseaseModelMarketplacePage = ({data, pageCount, searchParams}: {
    data: DiseaseModel[],
    pageCount: number,
    searchParams: SearchParams
}) => {
    const columns = useDiseaseModelsTableColumns(true, true, false)
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
                        <DatabaseDiseaseModelsTable
                            data={data} 
                            pageCount={pageCount} 
                            columns={columns}
                            searchParams={searchParams}
                            onSelectionChange={setRowSelection}
                            showPagination={true}
                            interactive={false}
                        />
                    </React.Suspense>
                </FeatureFlagsProvider>
            </Shell>
        </main>
    )
}
