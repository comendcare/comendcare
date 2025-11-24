"use client";

import type { Column } from "@tanstack/react-table";
import * as React from "react";

import { Input } from "./../../../ui/input";
import { cn } from "./../../../../../packages/lib/utils";
import type { ExtendedColumnFilter } from "@comend/lib/types/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../../../ui/select";

interface DataTableRangeFilterProps<TData> extends React.ComponentProps<"div"> {
  filter: ExtendedColumnFilter<TData>;
  column: Column<TData>;
  inputId: string;
  onFilterUpdate: (
    filterId: string,
    updates: Partial<Omit<ExtendedColumnFilter<TData>, "filterId">>,
  ) => void;
}

export function DataTableRangeFilter<TData>({
  filter,
  column,
  inputId,
  onFilterUpdate,
  className,
  ...props
}: DataTableRangeFilterProps<TData>) {
  const meta = column.columnDef.meta;

  const [min, max] = React.useMemo(() => {
    const range = column.columnDef.meta?.range;
    if (range) return range;

    const values = column.getFacetedMinMaxValues();
    if (!values) return [0, 100];

    return [values[0], values[1]];
  }, [column]);

  const unitOptions = React.useMemo(() => {
    const unitOptions = column.columnDef.meta?.unitOptions;
    if (unitOptions) return unitOptions;

    return unitOptions;
  }, [column]);

  const formatValue = React.useCallback(
    (value: string | number | undefined) => {
      if (value === undefined || value === "") return "";
      const numValue = Number(value);
      return Number.isNaN(numValue)
        ? ""
        : numValue.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          });
    },
    [],
  );

  const value = React.useMemo(() => {
    if (Array.isArray(filter.value)) {
      return [
        formatValue(filter.value[0]), // lower limit
        formatValue(filter.value[1]), // upper limit
        filter.value[2] // units
      ]
    }
    return [formatValue(filter.value), ""];
  }, [filter.value, formatValue]);

  const onRangeValueChange = React.useCallback(
    (value: string, isMin?: boolean) => {
      const numValue = Number(value);
      const currentValues = Array.isArray(filter.value)
        ? filter.value
        : ["", ""];
      const otherValue = isMin
        ? (currentValues[1] ?? "")
        : (currentValues[0] ?? "");

      if (
        value === "" ||
        (!Number.isNaN(numValue) &&
          (isMin
            ? numValue >= min && numValue <= (Number(otherValue) || max)
            : numValue <= max && numValue >= (Number(otherValue) || min)))
      ) {
        onFilterUpdate(filter.filterId, {
          value: isMin ? [value, otherValue] : [otherValue, value],
        });
      }
    },
    [filter.filterId, filter.value, min, max, unitOptions, onFilterUpdate],
  );

  const onUnitValueChange = React.useCallback(
    (value: string) => {
      const currentValues = Array.isArray(filter.value)
        ? filter.value
        : ["", "", ""];
      onFilterUpdate(filter.filterId, {
        value: [currentValues[0], currentValues[1], value]
      })
    },
    [filter.filterId, filter.value, min, max, unitOptions, onFilterUpdate]
  )

  return (
    <div
      data-slot="range"
      className={cn("flex w-full items-center gap-2", className)}
      {...props}
    >
      <Input
        id={`${inputId}-min`}
        type="number"
        aria-label={`${meta?.label} minimum value`}
        aria-valuemin={min}
        aria-valuemax={max}
        data-slot="range-min"
        inputMode="numeric"
        placeholder={min.toString()}
        min={min}
        max={max}
        className="h-8 w-full rounded"
        defaultValue={value[0]}
        onChange={(event) => onRangeValueChange(event.target.value, true)}
      />
      <span className="sr-only shrink-0 text-muted-foreground">to</span>
      <Input
        id={`${inputId}-max`}
        type="number"
        aria-label={`${meta?.label} maximum value`}
        aria-valuemin={min}
        aria-valuemax={max}
        data-slot="range-max"
        inputMode="numeric"
        placeholder={max.toString()}
        min={min}
        max={max}
        className="h-8 w-full rounded"
        defaultValue={value[1]}
        onChange={(event) => onRangeValueChange(event.target.value)}
      />

      {unitOptions && (
        <div className="relative">
          <Select 
            defaultValue={value[2]}
            onValueChange={onUnitValueChange}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select a unit">
                {unitOptions.find(option => option.value === value[2])?.label || 'All units'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map(option => (
                <SelectItem
                  value={option.value}
                  key={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
