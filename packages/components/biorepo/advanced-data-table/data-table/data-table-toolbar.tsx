"use client";

import type { Column, Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import * as React from "react";

import { DataTableDateFilter } from "./../data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "./../data-table/data-table-faceted-filter";
import { DataTableSliderFilter } from "./../data-table/data-table-slider-filter";
import { DataTableViewOptions } from "./../data-table/data-table-view-options";
import { Button } from "./../../../ui/button";
import { Input } from "./../../../ui/input";
import { cn } from "./../../../../../packages/lib/utils";
import { DataTableSortList } from "./data-table-sort-list";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  enableSearch?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  enableSearch = false,
  ...props
}: DataTableToolbarProps<TData>) {
  const [globalFilter, setGlobalFilter] = useQueryState("q", {
    history: "replace",
    defaultValue: "",
  });
  
  const isFiltered =
    table.getState().columnFilters.length > 0 || globalFilter.length > 0;

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.columnDef.enableColumnFilter && !column.columnDef.meta?.showInAdvancedOnly),
    [table],
  );

  const onReset = React.useCallback(() => {
    table.resetColumnFilters();
    setGlobalFilter(""); // clear global search too
  }, [table]);

  // virtual column object for global search
  const globalColumn = React.useMemo(
    () => ({
      id: "global",
      getFilterValue: () => globalFilter,
      setFilterValue: (value: string) => setGlobalFilter(value),
      columnDef: {
        meta: { label: "Search...", variant: "text" },
      },
    }),
    [globalFilter, setGlobalFilter],
  );

  useEffect(() => {
    // whenever globalFilter changes, update the table's columnFilters
    table.setColumnFilters((prev) => {
      const withoutGlobal = prev.filter(f => f.id !== "g");
      if (!globalFilter) return withoutGlobal;
      return [...withoutGlobal, { id: "g", value: globalFilter }];
    });
  }, [globalFilter, table]);

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn(
        "flex w-full items-start justify-between gap-2 p-1",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* Global search input */}
        {enableSearch && <DataTableToolbarFilter key={'g'} column={globalColumn as any} />}

        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}

        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="outline"
            size="sm"
            className="border-dashed"
            onClick={onReset}
          >
            <X />
            Reset
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        <DataTableSortList table={table} />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

function DataTableToolbarFilter<TData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  {
    const columnMeta = column.columnDef.meta;

    const onFilterRender = React.useCallback(() => {
      if (!columnMeta?.variant) return null;

      switch (columnMeta.variant) {
        case "text":
          return (
            <Input
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              value={(column.getFilterValue() as string) ?? ""}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className="h-full w-40 lg:w-56"
            />
          );

        case "number":
          return (
            <div className="relative">
              <Input
                type="number"
                inputMode="numeric"
                placeholder={columnMeta.placeholder ?? columnMeta.label}
                value={(column.getFilterValue() as string) ?? ""}
                onChange={(event) => column.setFilterValue(event.target.value)}
                className={cn("h-8 w-[120px]", columnMeta.unit && "pr-8")}
              />
              {columnMeta.unit && (
                <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
                  {columnMeta.unit}
                </span>
              )}
            </div>
          );

        case "range":
          return (
            <DataTableSliderFilter
              column={column}
              title={columnMeta.label ?? column.id}
            />
          );

        case "date":
        case "dateRange":
          return (
            <DataTableDateFilter
              column={column}
              title={columnMeta.label ?? column.id}
              multiple={columnMeta.variant === "dateRange"}
            />
          );

        case "select":
        case "multiSelect":
          return (
            <DataTableFacetedFilter
              column={column}
              title={columnMeta.label ?? column.id}
              options={columnMeta.options ?? []}
              multiple={columnMeta.variant === "multiSelect"}
            />
          );

        default:
          return null;
      }
    }, [column, columnMeta]);

    return onFilterRender();
  }
}
