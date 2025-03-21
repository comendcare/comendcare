"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {toTitleCase} from "@/lib/utils";
import {SavedCompanyData} from "@/lib/types";

export const columns: ColumnDef<SavedCompanyData>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "company.title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
            <div>
                {row.original.company.title}
            </div>
        ),
    },
    {
        accessorKey: "company.website",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
            <div className="line-clamp-3 w-96">
                {row.original.company.description}
            </div>
        ),
    },
    {
        accessorKey: "company.website",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Website" />
        ),
        cell: ({ row }) => (
            <div>
                {row.original.company.website}
            </div>
        ),
    },
    {
        accessorKey: "engagement",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Engagement" />
        ),
        cell: ({ row }) => (
            <div>
                {toTitleCase(row.getValue("engagement"))}
            </div>
        ),
    },
    {
        accessorKey: "milestone.title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Milestone" />
        ),
        cell: ({ row }) => (
            <div>
                {row.original.milestone.title}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
