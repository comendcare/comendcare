"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CircleDashed,
  Globe,
  Lock,
  Pin,
  Text,
} from "lucide-react";
import * as React from "react";
import { DataTableColumnHeader } from "./../data-table/data-table-column-header";
import { REQUEST_STATUS_OPTIONS } from "./../../../../lib/types";
import { AssetActionsMenu } from "comend-pag-platform/components/tool-actions-menu";

export function getBiosampleRequestsTableColumns(): ColumnDef<any>[] {
  const comendColumns: ColumnDef<any>[] = [
    {
      id: "title",
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sample Title" />
      ),
      meta: {
        label: "Sample Title",
        placeholder: "Search samples...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
        id: "researcherEmail",
        accessorKey: "researcherEmail",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Researcher Email" />
        ),
        cell: ({ row }) => (
          <>
            {/* <div>
                {row.getValue("researcher.email")}
            </div> */}
          </>
        ),
        enableHiding: true,
    },
    {
        id: "status",
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <>
            {/* {(row.original.types || []).map((type: string) => {
              const typeOption = TOOL_TYPE_OPTIONS.find(t => t.id === type)
              return (
                <MilestoneTypeBadge label={typeOption.label}/>
              )
            })} */}
          </>
        ),
        enableHiding: true,
        enableColumnFilter: true,
        meta: {
          label: "Status",
          variant: "multiSelect",
          options: REQUEST_STATUS_OPTIONS.map(type => ({
              label: type.label, 
              value: type.id,
          })),
          icon: CircleDashed,
        },
    },
  ]

  const actionsColumn: ColumnDef<any>[] = [
    {
        id: "actions",
        cell: ({ row }) => <AssetActionsMenu tool={row.original} type={'biosample'}/>,
        enableHiding: false,
    },
  ]

  return [...comendColumns, ...actionsColumn]
}
