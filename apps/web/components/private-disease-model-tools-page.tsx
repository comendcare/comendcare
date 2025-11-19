"use client"

import * as React from "react";
import {EditAssetDialog, NewToolDialog} from "./edit-tool-dialog"
import {DataTableSkeleton} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import {DatabaseDiseaseModelsTable} from "@comend/components/biorepo/advanced-data-table/disease-models-table/database-disease-models-table"
import {FeatureFlagsProvider} from "@comend/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import {Shell} from "@comend/components/biorepo/advanced-data-table/lib/shell";
import {
    useDiseaseModelsTableColumns
} from "@comend/components/biorepo/advanced-data-table/disease-models-table/private-disease-models-table-columns";
import type {DiseaseModel, Tool} from "@prisma/client";
import {SearchParams} from "typesense/lib/Typesense/Documents";
import {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@comend/components/ui/tooltip";
import {Button} from "@comend/components/ui/button";
import {Lock, Globe} from "lucide-react"
import {setDiseaseModelsVisibility} from "@comend/lib/actions";
import {DiseaseModelBulkImportDialog} from "./disease-model-bulk-import-dialog";
import { Dialog, DialogPortal } from "@comend/components/ui/dialog";
import { Row } from "@tanstack/react-table";
import Image from "next/image";

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
                            onRowClickCallback={(e: any, row: Row<any> | undefined) => setEditingTool(row?.original)}
                            showPagination={true}
                            noResultsOverride={(
                                <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center py-8">
                                    <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                                        <h1 className="font-cal text-4xl">You do not have any Disease Model Tools</h1>
                                        <Image
                                            alt="No Disease Model Tools"
                                            src="https://illustrations.popsy.co/gray/graphic-design.svg"
                                            width={300}
                                            height={300}
                                        />
                                        <p className="text-lg text-stone-500">
                                            A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                                        </p>
                                        <NewToolDialog type={"diseaseModel"}/>
                                    </div>
                                </div>
                            )}
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
                                                    type={'diseaseModel'}
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
