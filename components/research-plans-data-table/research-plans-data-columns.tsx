"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Asset, MODALITIES } from "@/lib/types"
import { Button } from "../ui/button"
import { Pin } from "lucide-react"
import { createOrUpdateAsset } from "@/lib/actions"
import { Roadmap } from "@prisma/client"
import { Badge } from "../ui/badge"

interface CustomColumnMeta {
    name?: string;
}

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData, TValue> extends CustomColumnMeta {}
}

export const columns: ColumnDef<Roadmap>[] = [
    {
        accessorKey: "research-plan.title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
            <div>
                {row.original.title || 'Untitled Research Plan'}
            </div>
        ),
        enableHiding: true,
        meta: { name: "Name" }
    },
    {
        accessorKey: "research-plan.description",
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
        accessorKey: "research-plan.modality",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
            <ul className="flex flex-col gap-2">
                {MODALITIES.filter(modality => row.original.modalities.includes(modality.value)).map(modality => (
                    <li>
                        <Badge variant={"secondary"}>{modality.label}</Badge>
                    </li>
                ))}
            </ul>
        ),
        enableHiding: true,
        meta: { name: "Description" }
    },
]
