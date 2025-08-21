"use client";

import * as React from "react";
import {DataTable} from "@comend/components/biorepo/advanced-data-table/data-table/data-table";
import {
    DataTableAdvancedToolbar
} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-advanced-toolbar";
import {DataTableFilterList} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-filter-list";
import {DataTableFilterMenu} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-filter-menu";
import {DataTableSortList} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-sort-list";
import {DataTableToolbar} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-toolbar";
import {useDataTable} from "@comend/lib/hooks/use-data-table";
import {ColumnDef, Row} from "@tanstack/react-table";
import {Tool} from "@prisma/client";
import Image from "next/image";
import { NewToolDialog } from "comend-pag-platform/components/edit-tool-dialog";
import { SearchParams } from "typesense/lib/Typesense/Documents";
import { useBiosampleSearchStore } from "../../../../../state/search/biosampleSearchStore";

export function BiosamplesTable({data, pageCount, columns, onSelectionChange, searchParams, showPagination = true}: {
    data: Tool[],
    pageCount: number,
    columns: ColumnDef<any>[],
    onSelectionChange?: (selectedRows: Tool[]) => void,
    searchParams: SearchParams,
    showPagination?: boolean
}) {
    const {table, shallow, debounceMs, throttleMs} = useDataTable({
        data,
        columns,
        pageCount,
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
                useStore={useBiosampleSearchStore}
                noResults={
                    (data.length === 0 && Object.keys(searchParams).length === 0) 
                    ? (
                        <div className="pt-6 h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
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
                                <NewToolDialog numAssetsPinned={0} type={"biosample"}/>
                            </div>
                        </div>
                    )
                    : undefined
                }
            />
        </>
    );
}
