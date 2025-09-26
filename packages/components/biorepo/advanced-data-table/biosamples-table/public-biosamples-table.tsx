"use client";

import * as React from "react";
import {DataTable} from "./../data-table/data-table";
import {useDataTable} from "./../../../../../packages/lib/hooks/use-data-table";
import {ColumnDef, Row} from "@tanstack/react-table";
import {Tool} from "@prisma/client";
import Image from "next/image";
import { NewToolDialog } from "comend-pag-platform/components/edit-tool-dialog";
import { SearchParams } from "typesense/lib/Typesense/Documents";
import { useBiosampleSearchStore } from "../../../../../state/search/biosampleSearchStore";
import {DataTableToolbar} from "./../data-table/data-table-toolbar";

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
                // noResults={
                //     (data.length === 0 && Object.keys(searchParams).length === 0) 
                //     ? (
                //         <div className="pt-6 h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center py-8">
                //             <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                //                 <h1 className="font-cal text-4xl">You do not have any Biosample Tools</h1>
                //                 <Image
                //                     alt="No Biosample Tools"
                //                     src="https://illustrations.popsy.co/gray/graphic-design.svg"
                //                     width={300}
                //                     height={300}
                //                 />
                //                 <p className="text-lg text-stone-500">
                //                     A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                //                 </p>
                //                 <NewToolDialog type={"biosample"}/>
                //             </div>
                //         </div>
                //     )
                //     : undefined
                // }
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
