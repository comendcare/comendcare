"use client"

import * as React from "react";
import {NewToolDialog} from "./edit-tool-dialog"
import {DataTableSkeleton} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import {BiosamplesTable} from "@comend/components/biorepo/advanced-data-table/biosamples-table/private-biosamples-table"
import {FeatureFlagsProvider} from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import {Shell} from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import {
    useBiosamplesTableColumns
} from "@/packages/components/biorepo/advanced-data-table/biosamples-table/private-biosamples-table-columns";
import {Tool} from "@prisma/client";
import {BiosampleBulkImportDialog} from "./biosample-bulk-import-dialog";
import {SearchParams} from "@/packages/components/types";
import {useEffect, useState} from "react";
import {revalidate} from "@/packages/lib/revalidate";
import { Button } from "@/packages/components/ui/button";
import { Globe, Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/packages/components/ui/tooltip";
import { setBiosamplesVisibility } from "@/packages/lib/actions";
import { useSession } from "next-auth/react";

export const PrivateBiosampleToolsPage = ({data, pageCount, searchParams}: {
    data: Tool[],
    pageCount: number,
    searchParams: SearchParams
}) => {
    const columns = useBiosamplesTableColumns()
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
                                                await setBiosamplesVisibility(session?.user.organizationId, rowSelection.map((row: any) => row.id), true)
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
                                                await setBiosamplesVisibility(session?.user.organizationId, rowSelection.map((row: any) => row.id), false)
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
                            <BiosampleBulkImportDialog/>
                            <NewToolDialog type={"biosample"}/>
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
                        <BiosamplesTable 
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
