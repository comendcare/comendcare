"use client";

import * as React from "react";
import {DataTable} from "./../data-table/data-table";
import {
    DataTableAdvancedToolbar
} from "./../data-table/data-table-advanced-toolbar";
import {DataTableFilterList} from "./../data-table/data-table-filter-list";
import {DataTableToolbar} from "./../data-table/data-table-toolbar";
import {useDataTable} from "./../../../../../packages/lib/hooks/use-data-table";
import {ColumnDef, Row} from "@tanstack/react-table";
import {useFeatureFlags} from "../lib/feature-flags-provider";
import type {Biosample, Tool} from "@prisma/client";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { EditAssetDialog, NewToolDialog } from "comend-pag-platform/components/edit-tool-dialog";
import { SearchParams } from "typesense/lib/Typesense/Documents";
import { useState } from "react";
import { Dialog, DialogPortal } from "./../../../ui/dialog";

const globalFilterFn = (row: any, columnIds: string[], filterValue: any) => {
    // normalize search term
    const search = String(filterValue ?? "").toLowerCase();

    // get values from both columns
    const sampleId = String(row.original.id ?? "").toLowerCase();
    const donorId = String(row.original.donor?.internalId ?? "").toLowerCase();

    // return true if either matches
    return sampleId.includes(search) || donorId.includes(search);
}

export function DatabaseBiosamplesTable({
    data, 
    pageCount, 
    columns, 
    onSelectionChange, 
    searchParams,
    showFilters = true,
    showPagination = true,
    interactive = true,
    noResultsOverride = true,
}: {
    data: Biosample[],
    pageCount: number,
    columns: ColumnDef<any>[],
    onSelectionChange?: (selectedRows: Tool[]) => void,
    searchParams: SearchParams,
    showFilters?: boolean,
    showPagination?: boolean,
    interactive?: boolean,
    noResultsOverride?: boolean,
}) {
    const [editingTool, setEditingTool] = useState<any | undefined>(undefined)
    const {enableAdvancedFilter, filterFlag} = useFeatureFlags()
    const {table, shallow, debounceMs, throttleMs} = useDataTable({
        data,
        columns,
        pageCount,
        enableAdvancedFilter: showFilters && enableAdvancedFilter,
        initialState: {
            sorting: [],
            columnPinning: {right: ["actions"], left: ["select"]},
        },
        getRowId: (originalRow) => originalRow.id,
        shallow: false,
        clearOnDefault: true,
        enableRowSelection: true,
    });

    React.useEffect(() => {
        if (!onSelectionChange) return;

        const selected = table.getSelectedRowModel().rows.map((row: Row<any>) => row.original);
        onSelectionChange(selected);
    }, [table.getSelectedRowModel().rows, onSelectionChange])
    

    return (
        <>
            <DataTable
                table={table}
                showPagination={showPagination}
                noResults={
                    (noResultsOverride && data.length === 0 && Object.keys(searchParams).length === 0) 
                    ? (
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
                                <NewToolDialog type={"biosample"}/>
                            </div>
                        </div>
                    )
                    : undefined
                }
                onRowClickCallback={(e: any, row: Row<any> | undefined) => 
                    setEditingTool(row?.original)
                }
            >
                {showFilters && (
                    enableAdvancedFilter ? (
                        <DataTableAdvancedToolbar table={table}>
                            <DataTableFilterList
                                table={table}
                                shallow={shallow}
                                debounceMs={debounceMs}
                                throttleMs={throttleMs}
                                align="start"
                            />
                        </DataTableAdvancedToolbar>
                    ) : (
                        <DataTableToolbar table={table} enableSearch={true}/>
                    )
                )}
            </DataTable>

            {interactive && (
                <Dialog 
                    open={!!editingTool}
                    onOpenChange={(open) => !open && setEditingTool(undefined)}
                >
                    <DialogPortal>
                        <div onClick={(e) => e.stopPropagation()}>
                            <EditAssetDialog
                                key={editingTool?.id}
                                data={editingTool} 
                                type={'biosample'}
                                closeDialog={() => {setEditingTool(undefined)}}
                            />
                        </div>
                    </DialogPortal>
                </Dialog>
            )}
        </>
    );
}
