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
import {useFeatureFlags} from "../lib/feature-flags-provider";
import {Tool} from "@prisma/client";

export function BiosamplesTable({data, pageCount, columns, onSelectionChange}: {
    data: Tool[],
    pageCount: number,
    columns: ColumnDef<any>[]
    onSelectionChange?: (selectedRows: Tool[]) => void;
}) {
    const {enableAdvancedFilter, filterFlag} = useFeatureFlags()
    const {table, shallow, debounceMs, throttleMs} = useDataTable({
        data,
        columns,
        pageCount,
        enableAdvancedFilter,
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
            >
                {enableAdvancedFilter ? (
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
                    <DataTableToolbar table={table}>
                    </DataTableToolbar>
                )}
            </DataTable>
        </>
    );
}
