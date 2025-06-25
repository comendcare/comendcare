"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "./data-table-column-header"

export const columns: ColumnDef<any>[] = [
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
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => <div>{row.getValue("type")}</div>,
    },
    {
        accessorKey: "title",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
        accessorKey: "disease",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Disease" />,
        cell: ({ row }) => <div>{row.getValue("disease")}</div>,
    },
    {
        accessorKey: "publications",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Publications" />,
        cell: ({ row }) => {
            const link = row.getValue("publications");
            return link ? (
                <a href={link as string} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                    Link
                </a>
            ) : (
                <span className="text-muted-foreground">N/A</span>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => <div>{row.getValue("status")}</div>,
    },
    {
        accessorKey: "applicationDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Application Date" />,
        cell: ({ row }) => <div>{row.getValue("applicationDate")}</div>,
    },
]
