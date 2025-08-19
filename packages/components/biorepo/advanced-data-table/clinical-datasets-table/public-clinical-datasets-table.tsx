"use client";

import * as React from "react";
import { DataTable } from "@comend/components/biorepo/advanced-data-table/data-table/data-table";
import { DataTableAdvancedToolbar } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-filter-list";
import { DataTableFilterMenu } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-filter-menu";
import { DataTableSortList } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-sort-list";
import { DataTableToolbar } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-toolbar";
import { useDataTable } from "@comend/lib/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useFeatureFlags } from "../lib/feature-flags-provider";
import { Tool } from "@prisma/client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { NewToolDialog } from "comend-pag-platform/components/edit-tool-dialog";
import { SearchParams } from "typesense/lib/Typesense/Documents";

export function ClinicalDatasetsTable({data, pageCount, columns, searchParams}: {data: Tool[], pageCount: number, columns: ColumnDef<any>[], searchParams: SearchParams}) {
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
        noResults={
            (data.length === 0 && Object.keys(searchParams).length === 0) 
            ? (
              <div className="pt-6 h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                  <div className="h-full w-full flex flex-col justify-center items-center gap-4 max-w-lg text-center">
                      <h1 className="font-cal text-4xl">You do not have any Data Tools</h1>
                      <Image
                          alt="No Data Tools"
                          src="https://illustrations.popsy.co/gray/graphic-design.svg"
                          width={300}
                          height={300}
                      />
                      <p className="text-lg text-stone-500">
                          A tool is a project outcome that can be used for future research. Ex/ clinical datasets, disease models, papers.
                      </p>
                      <NewToolDialog numAssetsPinned={0} type={"data"}/>
                  </div>
              </div>
            )
            : undefined
        }
      />
    </>
  );
}
