"use client"

import * as React from "react";
import {EditAssetDialog, NewToolDialog} from "./edit-tool-dialog"
import {DataTableSkeleton} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-skeleton";
import {DatabaseBiosamplesTable} from "@comend/components/biorepo/advanced-data-table/biosamples-table/database-biosamples-table"
import {FeatureFlagsProvider} from "@comend/components/biorepo/advanced-data-table/lib/feature-flags-provider";
import {Shell} from "@comend/components/biorepo/advanced-data-table/lib/shell";
import {
    useBiosamplesTableColumns
} from "@comend/components/biorepo/advanced-data-table/biosamples-table/private-biosamples-table-columns";
import type {Biosample} from "@prisma/client";
import {BiosampleBulkImportDialog} from "./biosample-bulk-import-dialog";
import {SearchParams} from "@comend/components/types";
import {useEffect, useRef, useState} from "react";
import { Button, buttonVariants } from "@comend/components/ui/button";
import { Globe, Lock, Plus, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { setBiosamplesVisibility } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogPortal, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Row } from "@tanstack/react-table";
import { Asset, editBiosampleForm } from "@comend/lib/types";
import Image from "next/image";
import { DeleteBiosampleDialog } from "./delete-biosample-dialog";
import z from "zod";
import { cn } from "@comend/lib/utils";
import { PulsatingButton } from "@comend/components/ui/pulsating-button";
import {NoResultsTemplate} from "@comend/components/no-results"

export const PrivateBiosampleToolsPage = ({data, pageCount, searchParams}: {
    data: Biosample[],
    pageCount: number,
    searchParams: SearchParams
}) => {
    const {data: session} = useSession()
    const columns = useBiosamplesTableColumns({session})
    const [rowSelection, setRowSelection] = useState<Object[]>([])
    const [parentWidth, setParentWidth] = useState(0)
    const [isCollapsed, setIsCollapsed] = useState(parentWidth <= 1160)
    const [editingTool, setEditingTool] = useState<Partial<Asset> | undefined>(undefined)
    const [isClosing, setIsClosing] = useState(false)
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
        setIsCollapsed(parentWidth <= 1160)
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
                                <Dialog>
                                    <DialogTrigger>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Button
                                                    variant={"destructive"}
                                                    size={isCollapsed ? "icon" : "default"}
                                                >
                                                    <Trash />
                                                    {!isCollapsed && `Delete selected`}
                                                </Button>
                                            </TooltipTrigger>
                                            {isCollapsed && (
                                                <TooltipContent>
                                                    Delete selected
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </DialogTrigger>
                                    <DeleteBiosampleDialog 
                                        toolIds={rowSelection.map((row: any) => row.id)} 
                                        closeDialog={() => {}}
                                    />
                                </Dialog>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button
                                            variant={"secondary"}
                                            size={isCollapsed ? "icon" : "default"}
                                            onClick={async () => {
                                                await setBiosamplesVisibility(session?.user.organizationId, rowSelection.map((row: any) => row.id), true)
                                            }}
                                        >
                                            <Lock />
                                            {!isCollapsed && `Make selected private`}
                                        </Button>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent>
                                            Make selected private
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button
                                            variant={"secondary"}
                                            size={isCollapsed ? "icon" : "default"}
                                            onClick={async () => {
                                                await setBiosamplesVisibility(session?.user.organizationId, rowSelection.map((row: any) => row.id), false)
                                            }}
                                        >
                                            <Globe />
                                            {!isCollapsed && `Make selected public`}
                                        </Button>
                                    </TooltipTrigger>
                                    {isCollapsed && (
                                        <TooltipContent>
                                            Make selected public
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                                </>
                            )}
                            <BiosampleBulkImportDialog/>
                            <NewToolDialog 
                                type={"biosample"} 
                                trigger={(
                                    data.length > 0 
                                        ? (
                                            <Button variant="cta">
                                                <Plus/>
                                                {"Create patient biosample"}
                                            </Button>
                                        )
                                        : (
                                            <PulsatingButton
                                                className={cn(buttonVariants({variant: 'cta'}))}
                                            >
                                                <Plus/>
                                                {"Create patient biosample"}
                                            </PulsatingButton>
                                        )
                                )}
                            />
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
                        <DatabaseBiosamplesTable 
                            data={data} 
                            pageCount={pageCount} 
                            columns={columns}
                            searchParams={searchParams}
                            onSelectionChange={setRowSelection}
                            onRowClickCallback={(e: any, row: Row<any> | undefined) => setEditingTool(row?.original)}
                            showPagination={true}
                            noResultsOverride={(
                                <NoResultsTemplate 
                                    imgAlt="No biosample tools"
                                    src="https://illustrations.popsy.co/gray/graphic-design.svg"
                                    title="You do not have any patient biosamples"
                                    description="A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, papers."
                                />
                            )}
                            interactiveDialog={(
                                <>
                                <Dialog 
                                    open={!!editingTool}
                                    onOpenChange={(open) => {
                                        if (!open) setIsClosing(true)
                                    }}
                                >
                                    <DialogPortal>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            {editingTool && (
                                                <EditAssetDialog
                                                    key={editingTool?.id}
                                                    data={editingTool} 
                                                    type={'biosample'}
                                                    isClosing={isClosing}
                                                    setIsClosing={setIsClosing}
                                                    closeDialog={() => {
                                                        setEditingTool(undefined)
                                                        setIsClosing(false)
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </DialogPortal>
                                </Dialog>
                                </>
                            )}
                        />
                    </React.Suspense>
                </FeatureFlagsProvider>
            </Shell>
        </main>
    )
}
