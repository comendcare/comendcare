"use client"

import * as React from "react";
import Image from "next/image"
import {EditAssetDialog, NewToolDialog} from "./edit-tool-dialog"
import {DataTableSkeleton} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import {DatabaseDiseaseModelsTable} from "@comend/components/biorepo/advanced-data-table/disease-models-table/database-disease-models-table"
import {FeatureFlagsProvider} from "@/packages/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import {Shell} from "@/packages/components/biorepo/advanced-data-table/lib/shell";
import {
    useDiseaseModelsTableColumns
} from "@/packages/components/biorepo/advanced-data-table/disease-models-table/private-disease-models-table-columns";
import type {DiseaseModel, Tool} from "@prisma/client";
import {SearchParams} from "typesense/lib/Typesense/Documents";
import {useEffect, useRef, useState} from "react";
import {revalidate} from "@/packages/lib/revalidate";
import {useSession} from "next-auth/react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/packages/components/ui/tooltip";
import {Button} from "@/packages/components/ui/button";
import {Lock, Globe} from "lucide-react"
import {setDiseaseModelsVisibility} from "@/packages/lib/actions";
import {DiseaseModelBulkImportDialog} from "./disease-model-bulk-import-dialog";
import { Dialog, DialogPortal } from "@/packages/components/ui/dialog";

export const PrivateDiseaseModelToolsPage = ({data, pageCount, searchParams}: {
    data: DiseaseModel[],
    pageCount: number,
    searchParams: SearchParams
}) => {
    const {data: session} = useSession()
    const columns = useDiseaseModelsTableColumns({session})
    const [rowSelection, setRowSelection] = useState<Object[]>([])
    const [parentWidth, setParentWidth] = useState(0)
    const [isCollapsed, setIsCollapsed] = useState(parentWidth <= 1100)
    const [editingTool, setEditingTool] = useState<DiseaseModel | undefined>(undefined)
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
                                                    await setDiseaseModelsVisibility(session?.user.organizationId, rowSelection.map((row: any) => row.id), true)
                                                }}
                                            >
                                                <Lock/>
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
                                                    await setDiseaseModelsVisibility(session?.user.organizationId, rowSelection.map((row: any) => row.id), false)
                                                }}
                                            >
                                                <Globe/>
                                                {!isCollapsed && `Make selected public`}
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
                        <DatabaseDiseaseModelsTable
                            data={data}
                            pageCount={pageCount}
                            columns={columns}
                            searchParams={searchParams}
                            onSelectionChange={setRowSelection}
                            interactiveDialog={(
                                <Dialog 
                                    open={!!editingTool}
                                    onOpenChange={(open) => !open && setEditingTool(undefined)}
                                >
                                    <DialogPortal>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            {editingTool && (
                                                <EditAssetDialog
                                                    key={editingTool?.id}
                                                    data={editingTool} 
                                                    type={'biosample'}
                                                    closeDialog={() => {setEditingTool(undefined)}}
                                                />
                                            )}
                                        </div>
                                    </DialogPortal>
                                </Dialog>
                            )}
                        />
                    </React.Suspense>
                </FeatureFlagsProvider>
            </Shell>
        </main>
    )
}
