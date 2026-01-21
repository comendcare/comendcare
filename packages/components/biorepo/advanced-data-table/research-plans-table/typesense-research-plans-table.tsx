"use client";

import * as React from "react";
import {DataTable} from "../data-table/data-table";
import {useDataTable} from "@comend/lib/hooks/use-data-table";
import {ColumnDef, Row} from "@tanstack/react-table";
import type {Roadmap, Tool} from "@prisma/client";
import { SearchParams } from "typesense/lib/Typesense/Documents";
import {DataTableToolbar} from "../data-table/data-table-toolbar";
import { useResearchPlanSearchStore } from "@/state/search/researchPlanSearchStore";

export function TypesenseResearchPlansTable({
    data, 
    pageCount, 
    columns, 
    onSelectionChange, 
    searchParams, 
    showPagination = true,
}: {
    data: Roadmap[],
    pageCount: number,
    columns: ColumnDef<any>[],
    onSelectionChange?: (selectedRows: Tool[]) => void,
    searchParams: SearchParams,
    showPagination?: boolean,
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
                useStore={useResearchPlanSearchStore}
            >
                {/* 
                    Required for in header sorting functionality, but hidden so we don't clog up the table
                    in the public views.
                */}
                <DataTableToolbar table={table} className="hidden"/>
            </DataTable>
        </>
    );
}
