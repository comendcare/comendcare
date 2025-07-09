"use client";

import * as React from "react";
import { DataTable } from "@comend/components/biorepo/advanced-data-table/data-table/data-table";
import { DataTableAdvancedToolbar } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-filter-list";
import { DataTableFilterMenu } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-filter-menu";
import { DataTableSortList } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-sort-list";
import { DataTableToolbar } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-toolbar";
import { useDataTable } from "@comend/lib/hooks/use-data-table";
import type { DataTableRowAction } from "@comend/components/types/data-table";
import { useFeatureFlags } from "./feature-flags-provider";
import { getBiosamplesTableColumns } from "./biosamples-table-columns";
import { Asset } from "@comend/lib/types";
import { getBiosamples } from "../lib/queries";

interface BiosamplesTableProps {
  // data: Asset[],
  promises: Promise<
    [
      Awaited<ReturnType<typeof getBiosamples>>,
      // Awaited<ReturnType<typeof getTaskStatusCounts>>,
      // Awaited<ReturnType<typeof getTaskPriorityCounts>>,
      // Awaited<ReturnType<typeof getEstimatedHoursRange>>,
    ]
  >;
}

export function BiosamplesTable({promises}: BiosamplesTableProps) {
  // const { enableAdvancedFilter, filterFlag } = useFeatureFlags();

  const [
    { data, pageCount },
    // statusCounts,
    // priorityCounts,
    // estimatedHoursRange,
  ] = React.use(promises);

  const columns = React.useMemo(
    () => getBiosamplesTableColumns({}),
    []
  );

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
    // enableAdvancedFilter,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
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
      >
        {/* {enableAdvancedFilter ? (
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
        ) : ( */}
          <DataTableToolbar table={table}>
            {/* <DataTableFilterList table={table} align="end" /> */}
            <DataTableSortList table={table} align="end" />
          </DataTableToolbar>
        {/* )} */}
      </DataTable>
    </>
  );
}
