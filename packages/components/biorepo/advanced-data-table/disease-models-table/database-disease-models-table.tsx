"use client";

import * as React from "react";
import {DataTable} from "../data-table/data-table";
import {
    DataTableAdvancedToolbar
} from "../data-table/data-table-advanced-toolbar";
import {DataTableFilterList} from "../data-table/data-table-filter-list";
import {DataTableToolbar} from "../data-table/data-table-toolbar";
import {useDataTable} from "@comend/lib/hooks/use-data-table";
import {ColumnDef, Row} from "@tanstack/react-table";
import {useFeatureFlags} from "../lib/feature-flags-provider";
import type {DiseaseModel, Tool} from "@prisma/client";
import Image from "next/image";
import { EditAssetDialog, NewToolDialog } from "comend-pag-platform/components/edit-tool-dialog";
import { SearchParams } from "typesense/lib/Typesense/Documents";
import { Dialog, DialogPortal } from "../../../ui/dialog";
import { useState } from "react";

export function DatabaseDiseaseModelsTable({
    data, 
    pageCount, 
    columns, 
    onSelectionChange, 
    onRowClickCallback,
    searchParams,
    showFilters = true,
    showPagination = true,
    noResultsOverride = true,
    interactiveDialog,
}: {
    data: DiseaseModel[],
    pageCount: number,
    columns: ColumnDef<any>[],
    onSelectionChange?: (selectedRows: Tool[]) => void,
    onRowClickCallback?: (e: any, row: Row<any> | undefined) => void,
    searchParams: SearchParams,
    showFilters?: boolean,
    showPagination?: boolean,
    noResultsOverride?: React.ReactNode,
    interactiveDialog?: React.ReactNode
}) {
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
                    (data.length === 0 && Object.keys(searchParams).length === 0) 
                    ? (
                        <>{!!noResultsOverride && noResultsOverride}</>
                    )
                    : undefined
                }
                onRowClickCallback={onRowClickCallback}
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

            {/* {interactive && (
                <Dialog 
                    open={!!editingTool}
                    onOpenChange={(open) => !open && setEditingTool(undefined)}
                >
                    <DialogPortal>
                        <div onClick={(e) => e.stopPropagation()}>
                            <EditAssetDialog
                                key={editingTool?.id}
                                data={editingTool} 
                                type={'diseaseModel'}
                                closeDialog={() => {setEditingTool(undefined)}}
                            />
                        </div>
                    </DialogPortal>
                </Dialog>
            )} */}

            {!!interactiveDialog && interactiveDialog}
        </>
    );
}
