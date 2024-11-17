"use client"

import {ColumnDef} from "@tanstack/react-table"

import {Badge} from "@/components/ui/badge"
import {Checkbox} from "@/components/ui/checkbox"

import {statuses} from "@/lib/data";
import {UserForm} from "@/lib/schemas";
import {UserFormsDataTableColumnHeader} from "./user-forms-data-table-column-header"
import {UserFormsDataTableRowActions} from "./user-forms-data-table-row-actions"

export const userFormsTableColumns: ColumnDef<UserForm>[] = [
    {
        id: "select",
        header: ({table}) => (
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
        cell: ({row}) => (
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
    // {
    //   accessorKey: "id",
    //   header: ({ column }) => (
    //     <UserFormsDataTableColumnHeader column={column} title="ID" />
    //   ),
    //   cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
        accessorKey: "title",
        header: ({column}) => (
            <UserFormsDataTableColumnHeader column={column} title="Title"/>
        ),
        cell: ({row}) => {
            // const label = labels.find((label) => label.value === row.original.label)

            return (
                <div className="flex space-x-2">
                    {true && <Badge variant="positive">New</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
                </div>
            )
        },
    },
    {
        accessorKey: "author",
        header: ({column}) => (
            <UserFormsDataTableColumnHeader column={column} title="Author"/>
        ),
        cell: ({row}) => {
            return (
                <div className="flex items-center">
                    <span>{row.getValue("author")}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "status",
        header: ({column}) => (
            <UserFormsDataTableColumnHeader column={column} title="Status"/>
        ),
        cell: ({row}) => {
            const status = statuses.find(
                (status) => status.value === row.getValue("status")
            )

            if (!status) {
                return null
            }

            return (
                <div className="flex w-[120px] items-center">
                    {status.icon && (
                        <status.icon className="mr-2 h-4 w-4 text-muted-foreground"/>
                    )}
                    <span>{status.label}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "createdOn",
        header: ({column}) => (
            <UserFormsDataTableColumnHeader column={column} title="Created on"/>
        ),
        cell: ({row}) => {
            return (
                <div className="flex items-center">
                    <span>{row.getValue("createdOn")}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        id: "actions",
        cell: ({row}) => <UserFormsDataTableRowActions row={row}/>,
    },
]
