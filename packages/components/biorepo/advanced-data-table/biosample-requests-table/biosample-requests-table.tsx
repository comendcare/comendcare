"use client";

import * as React from "react";
import { DataTable } from "./../data-table/data-table";
import { DataTableAdvancedToolbar } from "./../data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "./../data-table/data-table-filter-list";
import { DataTableFilterMenu } from "./../data-table/data-table-filter-menu";
import { DataTableSortList } from "./../data-table/data-table-sort-list";
import { DataTableToolbar } from "./../data-table/data-table-toolbar";
import { useDataTable } from "./../../../../../packages/lib/hooks/use-data-table";
import { getBiosamples } from "../lib/queries";
import { ColumnDef } from "@tanstack/react-table";
import { useFeatureFlags } from "../lib/feature-flags-provider";
import Image from "next/image"

interface BiosampleRequestsTableProps {
  promises: Promise<[Awaited<ReturnType<typeof getBiosamples>>]>,
  columns: ColumnDef<any>[]
}

export function BiosampleRequestsTable({promises, columns}: BiosampleRequestsTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags();
  const [{ data, pageCount }] = React.use(promises);
  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter,
    initialState: {
      sorting: [],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable
        table={table}
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableSortList table={table} align="start" />
            {filterFlag === "advancedFilters" ? (
              <DataTableFilterList
                table={table}
                shallow={shallow}
                debounceMs={debounceMs}
                throttleMs={throttleMs}
                align="start"
              />
            ) : (
              <DataTableFilterMenu
                table={table}
                shallow={shallow}
                debounceMs={debounceMs}
                throttleMs={throttleMs}
              />
            )}
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} align="end" />
          </DataTableToolbar>
        )}
      </DataTable>
    </>
  );
}
