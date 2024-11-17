"use client"

import {ColumnDef} from "@tanstack/react-table"

import {Badge} from "@/components/ui/badge"
import {Checkbox} from "@/components/ui/checkbox"

import {types} from "@/lib/data";
import {UserForm} from "@/lib/schemas";
import {UserFormsDataTableColumnHeader} from "./user-forms-data-table-column-header"
import {UserFormsDataTableRowActions} from "./user-forms-data-table-row-actions"
import {formatDate} from "@/lib/utils";

export const userFormsTableColumns: ColumnDef<UserForm>[] = [
    {
        accessorKey: "title",
        header: ({column}) => (
            <UserFormsDataTableColumnHeader column={column} title="Title"/>
        ),
        cell: ({row}) => {
            // Get the createdOn date for the row
            const createdOn = new Date(row.original.createdOn);
            const currentDate = new Date();

            // Calculate the difference in months
            const monthsDifference =
                (currentDate.getFullYear() - createdOn.getFullYear()) * 12 +
                (currentDate.getMonth() - createdOn.getMonth());

            const isNew = monthsDifference <= 3

            return (
                <div className="flex space-x-2">
                    {isNew && <Badge variant="positive">New</Badge>}
                    <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
                </div>
            )
        },
    },
    {
        accessorKey: "type",
        header: ({column}) => (
            <UserFormsDataTableColumnHeader column={column} title="Type"/>
        ),
        cell: ({row}) => {
            const type = types.find(
                (type) => type.value === row.getValue("type")
            )

            if (!type) {
                return null
            }

            return (
                <div className="flex w-[120px] items-center">
                    {type.icon && (
                        <type.icon className="mr-2 h-4 w-4 text-muted-foreground"/>
                    )}
                    <span>{type.label}</span>
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
            <UserFormsDataTableColumnHeader column={column} title="Joined on"/>
        ),
        cell: ({row}) => {
            return (
                <div className="flex items-center">
                    <span>{formatDate(row.getValue("createdOn"))}</span>
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
