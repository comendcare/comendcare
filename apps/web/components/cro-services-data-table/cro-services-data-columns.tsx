"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { Badge } from "@comend/components/ui/badge"
import {MILESTONE_TYPE_OPTIONS} from "@comend/lib/types"
import {getMilestonesForService} from "@/packages/lib/utils";

export type ServicesData = {
    name: string | null
    description: string | null
}

export const columns: ColumnDef<ServicesData>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => <div>{row.getValue("description")}</div>,
    },
    {
        id: "relatedProjectTypes",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Related project types" />
        ),
        cell: ({ row }) => {
            const serviceName = row.original.name
            const milestones = getMilestonesForService(serviceName)
            if (!milestones.length) return <span className="text-muted-foreground">—</span>
            return (
                <div className="flex flex-wrap gap-1">
                    {milestones.map((m) => (
                        <Badge key={m.id} variant="secondary" className="px-2">
                            {m.label}
                        </Badge>
                    ))}
                </div>
            )
        },
        enableSorting: false,
    },
]
