"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {OrganizationToCompanyEngagement} from "@prisma/client";

// Assuming your data shape looks like this:
export type StrainData = {
    id: string
    organizationId: string
    companyId: string
    milestoneId: string
    engagement: OrganizationToCompanyEngagement
    updatedAt: Date
    createdAt: Date
}

export const columns: ColumnDef<StrainData>[] = [
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
    // },
    // {
    //     accessorKey: "Strain ID",
    //     header: ({ column }) => (
    //         <DataTableColumnHeader column={column} title="Strain ID" />
    //     ),
    //     cell: ({ row }) => <div className="w-[100px]">{row.getValue("Strain ID")}</div>,
    //     enableSorting: true,
    // },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
            <div>
                {row.getValue("name")}
            </div>
        ),
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
            <div>
                {row.getValue("description")}
            </div>
        ),
    },
    {
        accessorKey: "engagement",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
            <div>
                {row.getValue("description")}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
