"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { Asset } from "@/lib/types"
import { Pin } from "lucide-react"

interface CustomColumnMeta {
    name?: string;
}

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData, TValue> extends CustomColumnMeta {}
}

export const columns: ColumnDef<Asset>[] = [
    {
        accessorKey: "asset.title",
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
        accessorKey: "asset.description",
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
        accessorKey: "asset.private",
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
        accessorKey: "asset.milestones",
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
        accessorKey: "asset.contacts",
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
        accessorKey: "asset.links",
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
        accessorKey: "asset.pinned",
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
