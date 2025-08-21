import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import type * as React from "react";

import { DataTablePagination, TypesenseDataTablePagination } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@comend/components/ui/table";
import { getCommonPinningStyles } from "@comend/lib/data-table";
import { cn } from "@comend/lib/utils";
import { useEffect, useRef, useState } from "react";
import { StoreApi, UseBoundStore } from "zustand";
import { TemporalState } from "zundo";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  noResults?: React.ReactNode;
  actionBar?: React.ReactNode;
  showPagination?: boolean;
  // useStore?: UseBoundStore<Write<StoreApi<any>, {temporal: StoreApi<TemporalState<any>>;}>>
  useStore?: any;
}

export function DataTable<TData>({
  table,
  noResults,
  actionBar,
  showPagination = true,
  useStore,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [overlayStyle, setOverlayStyle] = useState({ width: 0, paddingTop: 0});

  useEffect(() => {
    const updateOverlay = () => {
      if (scrollContainerRef.current && headerRef.current) {
        const widthRect = scrollContainerRef.current.getBoundingClientRect();
        const paddingRect = headerRef.current.getBoundingClientRect();

        setOverlayStyle({
          width: widthRect.width, 
          paddingTop: paddingRect.height,
        });
      }
    };

    updateOverlay();
    window.addEventListener("resize", updateOverlay);
    return () => window.removeEventListener("resize", updateOverlay);
  }, []);

  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      <div className="relative overflow-hidden rounded-md border" ref={scrollContainerRef}>
        <Table>
          <TableHeader ref={headerRef as React.LegacyRef<HTMLTableSectionElement>}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )
            )}
          </TableBody>
        </Table>
        {/* no results overlay */}
        {!table.getRowModel().rows?.length && (
          <div
            className="absolute left-0 top-0 h-[calc(100%-16px)] flex justify-center items-center"
            style={{width: overlayStyle.width, paddingTop: overlayStyle.paddingTop}}
          >
            {noResults
              ? (
                <div className="h-full flex flex-col justify-center">{noResults}</div>
              )
              : (
                <div className="h-full flex flex-col justify-center">No results.</div>
              )
            }
          </div>
        )}
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
