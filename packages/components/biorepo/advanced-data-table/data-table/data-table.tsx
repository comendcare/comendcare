import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import type * as React from "react";

import { DataTablePagination } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-pagination";
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

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  noResults?: React.ReactNode;
  actionBar?: React.ReactNode;
}

export function DataTable<TData>({
  table,
  noResults,
  actionBar,
  children,
  className,
  ...props
}: DataTableProps<TData>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [overlayStyle, setOverlayStyle] = useState({ width: 0 });

  useEffect(() => {
    const updateOverlay = () => {
      if (scrollContainerRef.current) {
        const widthRect = scrollContainerRef.current.getBoundingClientRect();
        setOverlayStyle({width: widthRect.width});
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
      <div className="overflow-hidden rounded-md border" ref={scrollContainerRef}>
        <Table>
          <TableHeader>
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
            {/* no results overlay */}
            <div
              className="fixed flex justify-center items-center"
              style={{width: overlayStyle.width}}
            >
              {noResults
                ? (
                  <div>{noResults}</div>
                )
                : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )
              }
            </div>

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
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
