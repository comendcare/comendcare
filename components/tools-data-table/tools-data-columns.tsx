"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Tool } from "@/lib/types"
import { Button } from "../ui/button"
import { Pin } from "lucide-react"
import { createOrUpdateTool } from "@/lib/actions"

interface CustomColumnMeta {
    name?: string;
}

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData, TValue> extends CustomColumnMeta {}
}

export const columns: ColumnDef<Tool>[] = [
    {
        accessorKey: "tool.title",
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
        accessorKey: "tool.description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
            <div className="line-clamp-3">
                {row.original.description}
            </div>
        ),
        enableHiding: true,
        meta: { name: "Description" }
    },
    {
        accessorKey: "tool.private",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Visibility" />
        ),
        cell: ({ row }) => (
            <div>
                {row.original.private ? 'Private' : 'Public'}
            </div>
        ),
        enableHiding: true,
        meta: { name: "Private" }
    },
    {
        accessorKey: "tool.milestones",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Linked Projects" />
        ),
        cell: ({ row }) => (
            <ul className="flex flex-col gap-2">
                {row.original.milestones.map((milestone, index) => (
                    <li key={index} className="line-clamp-2">
                        {milestone.milestone?.title || undefined}
                    </li>
                ))}
            </ul>
        ),
        enableHiding: true,
        meta: { name: "Linked Projects" }
    },
    {
        accessorKey: "tool.contacts",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Contacts" />
        ),
        cell: ({ row }) => (
            <ul className="flex flex-col gap-2">
                {row.original.contacts.map((contact, index) => (
                    <li key={index}>
                        {contact.name || contact.email || contact.affiliation}
                    </li>
                ))}
            </ul>
        ),
        enableHiding: true,
        meta: { name: "Contacts" }
    },
    {
        accessorKey: "tool.links",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Links" />
        ),
        cell: ({ row }) => (
            <ul className="flex flex-col gap-2">
                {row.original.attachments.map((attachment, index) => (
                    <li key={index} className="line-clamp-2">
                        {attachment.name || attachment.link}
                    </li>
                ))}
            </ul>
        ),
        enableHiding: true,
        meta: { name: "Links" }
    },
    {
        accessorKey: "tool.pinned",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Pinned"/>
        ),
        cell: ({ row }) => (
            <>
                {row.original.pinned ? <Pin fill="currentColor" className="h-4 w-4"/> : <Pin className="h-4 w-4"/>}
            </>
        ),
        enableHiding: true,
        meta: { name: "Pinned" }
    },
    // {
    //     id: "actions",
    //     cell: ({ row }) => <DataTableRowActions row={row} />,
    //     enableHiding: false,
    //     meta: { name: "Actions" }
    // },
]
