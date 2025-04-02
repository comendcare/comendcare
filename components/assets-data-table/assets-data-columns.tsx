"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Asset } from "@/lib/types"

interface CustomColumnMeta {
    name?: string;
}

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData, TValue> extends CustomColumnMeta {}
}

export const columns: ColumnDef<Asset>[] = [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={
    //                 table.getIsAllPageRowsSelected() ||
    //                 (table.getIsSomePageRowsSelected() && "indeterminate")
    //             }
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label="Select all"
    //             className="translate-y-[2px]"
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label="Select row"
    //             className="translate-y-[2px]"
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    //     meta: { name: "Select" }
    // },
    {
        accessorKey: "company.title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
            <div>
                {row.original.title}
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
                {row.original.description}
            </div>
        ),
        enableHiding: true,
        meta: { name: "Description" }
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
        enableHiding: false,
        meta: { name: "Actions" }
    },
]
