"use client"

import * as React from "react";
import { NewToolDialog } from "./edit-tool-dialog"
import { AssetBulkImportDialog } from "./asset-bulk-import-dialog"
import { DataTableSkeleton } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import { FeatureFlagsProvider } from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import { Shell } from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import { getClinicalDatasetsTableColumns } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/private-clinical-datasets-table-columns";
import { ClinicalDatasetsTable } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/private-clinical-datasets-table"
import type { Tool } from "@prisma/client";
import { SearchParams } from "@/packages/components/types";
import { revalidate } from "@/packages/lib/revalidate";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/packages/components/ui/tooltip";
import { Button } from "@/packages/components/ui/button";
import { Globe, Lock } from "lucide-react";
import { setDataToolsVisibility } from "@/packages/lib/actions";

export const PrivateDatasampleToolsPage = ({data, pageCount, searchParams}: {data: Tool[], pageCount: number, searchParams: SearchParams}) => {
    const columns = getClinicalDatasetsTableColumns()
    const {data: session} = useSession()
    const [rowSelection, setRowSelection] = useState<Object[]>([])
    const [parentWidth, setParentWidth] = useState(0)
    const [isCollapsed, setIsCollapsed] = useState(parentWidth <= 1100)
    const parentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry?.contentRect) {
            setParentWidth(entry.contentRect.width);
            }
        });

        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setIsCollapsed(parentWidth <= 1100)
    }, [parentWidth])

    return (
        <main 
            className="flex gap-4 flex-col w-full max-w-7xl my-4 h-full items-center mx-auto px-4"
            ref={parentRef}
        >
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
                                        size={isCollapsed ? "icon" : "default"}
                                        onClick={async () => {
                                            await setDataToolsVisibility(session?.user.organizationId, rowSelection.map((row: any) => row.id), true)
                                        }}
                                    >
                                        <Lock />
                                        {!isCollapsed && `Make selected private`}
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
                                        size={isCollapsed ? "icon" : "default"}
                                        onClick={async () => {
                                            await setDataToolsVisibility(session?.user.organizationId, rowSelection.map((row: any) => row.id), false)
                                        }}
                                    >
                                        <Globe />
                                        {!isCollapsed && `Make selected public`}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Make selected public
                                </TooltipContent>
                            </Tooltip>
                            </>
                        )}
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
                    <ClinicalDatasetsTable 
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