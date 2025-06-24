"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toTitleCase } from "@/lib/utils"
import { SavedCompanyData } from "@/lib/types"

interface CustomColumnMeta {
    name?: string;
}

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData, TValue> extends CustomColumnMeta {}
}

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
        meta: { name: "Select" }
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
        enableHiding: true,
        meta: { name: "Name" }
    },
    {
        accessorKey: "company.description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
            <div className="line-clamp-3 w-96">
                {row.original.company.description}
            </div>
        ),
        enableHiding: true,
        meta: { name: "Description" }
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
        enableHiding: true,
        meta: { name: "Website" }
    },
    // {
    //     accessorKey: "engagement",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Engagement" />
    //     ),
    //     cell: ({ row }) => (
    //         <div>
    //             {toTitleCase(row.getValue("engagement"))}
    //         </div>
    //     ),
    //     enableHiding: true,
    //     meta: { name: "Engagement" }
    // },
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
        enableHiding: true,
        meta: { name: "Milestone" }
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
        enableHiding: false,
        meta: { name: "Actions" }
    },
]
