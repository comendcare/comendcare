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
import { useEffect, useState } from "react";
import { revalidate } from "@/packages/lib/revalidate";
import { useSession } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/packages/components/ui/tooltip";
import { Button } from "@/packages/components/ui/button";
import { Lock, Globe } from "lucide-react"
import { setDiseaseModelsVisibility } from "@/packages/lib/actions";
import { DiseaseModelBulkImportDialog } from "./disease-model-bulk-import-dialog";

export const PrivateDiseaseModelToolsPage = ({data, pageCount, searchParams}: {data: Tool[], pageCount: number, searchParams: SearchParams}) => {
    const columns = useDiseaseModelsTableColumns()
    const {data: session} = useSession()
    const [rowSelection, setRowSelection] = useState<Object[]>([])

    // useEffect(() => {
    //     revalidate('/')
    // }, [])

    return (
        <main className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4">
        <Shell className="gap-2">
            <FeatureFlagsProvider
                additionalButtons={(
                    <>
                        {rowSelection?.length > 0 && (
                            <>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant={"secondary"}
                                        size={"icon"}
                                        onClick={async () => {
                                            await setDiseaseModelsVisibility(session?.user.organizationId, rowSelection.map((row: any) => row.id), true)
                                        }}
                                    >
                                        <Lock />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Make selected private
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant={"secondary"}
                                        size={"icon"}
                                        onClick={async () => {
                                            await setDiseaseModelsVisibility(session?.user.organizationId, rowSelection.map((row: any) => row.id), false)
                                        }}
                                    >
                                        <Globe />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Make selected public
                                </TooltipContent>
                            </Tooltip>
                            </>
                        )}
                        <DiseaseModelBulkImportDialog/>
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
                    <DiseaseModelsTable 
                        data={data} 
                        pageCount={pageCount} 
                        columns={columns} 
                        searchParams={searchParams}
                        onSelectionChange={setRowSelection}
                    />
                </React.Suspense>
            </FeatureFlagsProvider>
        </Shell>
        </main>
    )
}
