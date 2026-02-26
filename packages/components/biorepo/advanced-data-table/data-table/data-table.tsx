import { flexRender, Row, type Table as TanstackTable } from "@tanstack/react-table";
import type * as React from "react";

import { DataTablePagination, TypesenseDataTablePagination } from "./../data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./../../../ui/table";
import { getCommonPinningStyles } from "./../../../../../packages/lib/data-table";
import { cn } from "./../../../../../packages/lib/utils";
import { useEffect, useRef, useState } from "react";
import { MouseEvent } from "react";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  noResults?: React.ReactNode;
  actionBar?: React.ReactNode;
  showPagination?: boolean;
  useStore?: any;
  onRowClickCallback?: (e: MouseEvent, row: Row<TData> | undefined) => any
}

export function DataTable<TData>({
  table,
  noResults,
  actionBar,
  showPagination = true,
  onRowClickCallback,
  useStore,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerRowRef = useRef<any>(null);

  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      <div className="relative overflow-hidden rounded-md border" ref={scrollContainerRef}>
        {/* no results overlay */}
        {!table.getRowModel().rows?.length && (
          noResults ? (
            <div
              className={cn(
                "h-full w-full flex flex-col justify-center items-center absolute left-0 top-0",
                `pt-[${headerRef.current?.clientHeight || 48}px]`
              )}
            >
              <div className={"flex flex-col justify-start"}>{noResults}</div>
            </div>
          ) : (
            <div
              className={cn(
                "h-full w-full flex flex-col justify-center items-center absolute left-0 top-0",
                `pt-[${headerRef.current?.clientHeight || 48}px]`
              )}
            >
              <div className="h-full flex flex-col justify-center">
                <p className="p-6">No results.</p>
              </div>
            </div>
          )
        )}

        <Table>
          <TableHeader ref={headerRef as React.LegacyRef<HTMLTableSectionElement>}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} ref={headerRowRef}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      ...getCommonPinningStyles({ column: header.column }),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {/* content */}
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e: MouseEvent) => onRowClickCallback && onRowClickCallback(e, row)}
                  className={cn(onRowClickCallback ? "cursor-pointer group" : "")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        ...getCommonPinningStyles({ column: cell.column }),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              noResults
                ? (
                  <TableRow className="invisible">
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-fit"
                    >
                      {noResults}
                    </TableCell>
                  </TableRow>
                )
                : (
                  <TableRow className="invisible">
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-fit"
                    >
                      <p className="p-6">No results.</p>
                    </TableCell>
                  </TableRow>
                )
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2.5">
        {showPagination && (
          useStore
            ? <TypesenseDataTablePagination 
                resultsPerPage={useStore.getState().resultsPerPage} 
                setResultsPerPage={useStore.getState().setResultsPerPage} 
                totalPages={useStore.getState().totalPages} 
                page={useStore.getState().page}
                setPage={useStore.getState().setPage}
              />
            : <DataTablePagination table={table} />
        )}
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
