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
import { Button } from "@comend/components/ui/button";
import { Globe, Lock, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { setBiosamplesVisibility } from "@comend/lib/actions";
import { useSession } from "next-auth/react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogPortal, DialogTitle, DialogTrigger } from "@comend/components/ui/dialog";
import { Row } from "@tanstack/react-table";
import { Asset, editBiosampleForm } from "@comend/lib/types";
import Image from "next/image";
import { DeleteBiosampleDialog } from "./delete-biosample-dialog";
import z from "zod";
import { createOrUpdateBiosample, EditBiosampleToolForm } from "./edit-biosample-tool-form";
import LoadingDots from "@comend/components/icons/loading-dots";

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
    const [unsavedChanges, setUnsavedChanges] = useState<z.infer<typeof editBiosampleForm> | undefined>(undefined)
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
                                setUnsavedChanges={setUnsavedChanges} 
                                isClosing={isClosing}
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
                                <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center py-8">
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
                                        {<NewToolDialog 
                                            type={"biosample"} 
                                            setUnsavedChanges={setUnsavedChanges} 
                                            isClosing={isClosing}
                                            // closeDialog={(formValues: any) => {
                                            //     if (!!formValues) {
                                            //         setUnsavedChanges(formValues)
                                            //         setIsClosing(false)
                                            //     } else {
                                            //         setEditingTool(undefined)
                                            //         setIsClosing(false)
                                            //     }
                                            // }}
                                        />}
                                    </div>
                                </div>
                            )}
                            interactiveDialog={(
                                <>
                                <Dialog 
                                    open={!!editingTool}
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            setIsClosing(true)
                                        }
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
                                                    closeDialog={(formValues: any) => {
                                                        if (!!formValues) {
                                                            setUnsavedChanges(formValues)
                                                            setIsClosing(false)
                                                        } else {
                                                            setEditingTool(undefined)
                                                            setIsClosing(false)
                                                        }
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </DialogPortal>
                                </Dialog>

                                <UnsavedChangesDialog 
                                    setIsClosing={setIsClosing}
                                    unsavedChanges={unsavedChanges}
                                    setUnsavedChanges={setUnsavedChanges}
                                    editingTool={editingTool}
                                    setEditingTool={setEditingTool}
                                />
                                </>
                            )}
                        />
                    </React.Suspense>
                </FeatureFlagsProvider>
            </Shell>
        </main>
    )
}

const UnsavedChangesDialog = ({
    setIsClosing,
    unsavedChanges,
    setUnsavedChanges,
    editingTool,
    setEditingTool,
}: {
    setIsClosing: React.Dispatch<React.SetStateAction<boolean>>,
    unsavedChanges: any,
    setUnsavedChanges: React.Dispatch<React.SetStateAction<z.infer<typeof editBiosampleForm> | undefined>>
    editingTool: Partial<Asset> | undefined
    setEditingTool: React.Dispatch<React.SetStateAction<Partial<Asset> | undefined>>
}) => {
    const {data: session} = useSession()
    const [isSaving, setIsSaving] = useState(false)

    return (
        <Dialog 
            open={!!unsavedChanges}
            onOpenChange={(open) => {
                if (!open) {
                    setUnsavedChanges(undefined)
                    setIsClosing(false)
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>You have unsaved changes.</DialogTitle>
                    <DialogDescription>Would you like to save or discard these changes?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant={'secondary'}>Back to edit</Button>
                    </DialogClose>
                    <DialogClose 
                        asChild 
                        onClick={() => {
                            setUnsavedChanges(undefined)
                            setEditingTool(undefined)
                        }}
                    >
                        <Button variant={'destructive'}>Discard changes</Button>
                    </DialogClose>
                    <Button 
                        disabled={isSaving}
                        variant={'cta'}
                        onClick={async () => {
                            if (session && unsavedChanges) {
                                setIsSaving(true)
                                await createOrUpdateBiosample(session, editingTool, unsavedChanges, [])
                                setEditingTool(undefined)
                                setUnsavedChanges(undefined)
                                setIsSaving(false)
                            }
                        }}
                    >
                        {isSaving 
                            ? (
                                <div className="w-[81px] flex justify-center items-center">
                                    <LoadingDots/>
                                </div>
                            ) 
                            : ("Save changes")
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
