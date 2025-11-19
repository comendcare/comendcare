"use client";

import * as React from "react";
import {DataTable} from "../data-table/data-table";
import {DataTableAdvancedToolbar} from "../data-table/data-table-advanced-toolbar";
import {DataTableFilterList} from "../data-table/data-table-filter-list";
import {DataTableToolbar} from "../data-table/data-table-toolbar";
import {useDataTable} from "@comend/lib/hooks/use-data-table";
import {ColumnDef, Row} from "@tanstack/react-table";
import {useFeatureFlags} from "../lib/feature-flags-provider";
import type {Biosample, Tool} from "@prisma/client";
import { SearchParams } from "typesense/lib/Typesense/Documents";

export function DatabaseBiosamplesTable({
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
    data: Biosample[],
    pageCount: number,
    columns: ColumnDef<any>[],
    onSelectionChange?: (selectedRows: Tool[]) => void,
    onRowClickCallback?: (e: any, row: Row<any> | undefined) => void,
    searchParams: SearchParams,
    showFilters?: boolean,
    showPagination?: boolean,
    interactive?: boolean,
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
                    (data.length === 0 && Object.keys(searchParams).length === 0) 
                    ? (
                        // <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center py-8">
                        //     <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                        //         <h1 className="font-cal text-4xl">You do not have any Biosample Tools</h1>
                        //         <Image
                        //             alt="No Biosample Tools"
                        //             src="https://illustrations.popsy.co/gray/graphic-design.svg"
                        //             width={300}
                        //             height={300}
                        //         />
                        //         <p className="text-lg text-stone-500">
                        //             A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                        //         </p>
                        //         {interactive && <NewToolDialog type={"biosample"}/>}
                        //     </div>
                        // </div>
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

            {!!interactiveDialog && interactiveDialog}
        </>
    );
}
