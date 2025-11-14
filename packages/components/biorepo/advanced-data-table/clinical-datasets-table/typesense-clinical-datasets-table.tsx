"use client";

import * as React from "react";
import { DataTable } from "../data-table/data-table";
import { useDataTable } from "@comend/lib/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Tool } from "@prisma/client";
import { SearchParams } from "typesense/lib/Typesense/Documents";
import { useClinicalDatasetSearchStore } from "../../../../../state/search/clinicalDatasetSearchStore";
import {DataTableToolbar} from "../data-table/data-table-toolbar";

export function TypesenseClinicalDatasetsTable({data, pageCount, columns, searchParams, showPagination = true}: {data: Tool[], pageCount: number, columns: ColumnDef<any>[], searchParams: SearchParams, showPagination?: boolean}) {
  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable
        table={table}
        showPagination={showPagination}
        useStore={useClinicalDatasetSearchStore}
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
