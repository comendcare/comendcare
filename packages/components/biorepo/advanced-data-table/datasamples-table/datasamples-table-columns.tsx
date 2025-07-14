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
import { DataTableColumnHeader } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-column-header";
import { TOOL_TYPE_OPTIONS } from "@comend/lib/types";
import { MilestoneTypeBadge } from "@comend/components/milestone-type-badge";
import { AssetActionsMenu } from "comend-pag-platform/components/tool-actions-menu";

export function getDatasamplesTableColumns(): ColumnDef<any>[] {
  const comendColumns: ColumnDef<any>[] = [
    {
      id: "title",
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      meta: {
        label: "Title",
        placeholder: "Search titles...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
        accessorKey: "description",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
            <div className="line-clamp-3">
                {row.original.description}
            </div>
        ),
        enableHiding: true,
        enableColumnFilter: true
    },
    {
        id: "types",
        accessorKey: "types",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
          <>
            {(row.original.types || []).map((type: string) => {
              const typeOption = TOOL_TYPE_OPTIONS.find(t => t.id === type)
              return (
                <MilestoneTypeBadge label={typeOption.label}/>
              )
            })}
          </>
        ),
        enableHiding: true,
        enableColumnFilter: true,
        meta: {
          label: "Type",
          variant: "multiSelect",
          options: TOOL_TYPE_OPTIONS.filter(type => type.type === "data").map(type => ({
              label: type.label, 
              value: type.id,
          })),
          icon: CircleDashed,
        },
    },
    {
        id: "private",
        accessorKey: "private",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Visibility" />
        ),
        cell: ({ row }) => (
            <div>
                {row.getValue("private") ? 'Private' : 'Public'}
            </div>
        ),
        enableHiding: true,
        enableColumnFilter: true,
        meta: {
          label: "Visibility",
          variant: "multiSelect",
          options: [
            {
              label: "Private", 
              value: "true",
              icon: Lock,
            }, {
              label: "Public", 
              value: "false",
              icon: Globe
            }
          ],
          icon: CircleDashed,
        },
    },
    {
        accessorKey: "milestones",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Linked Projects" />
        ),
        cell: ({ row }) => (
            <ul className="flex flex-col gap-2">
                {row.original.milestones?.map((milestone: any, index: number) => (
                    <li key={index} className="line-clamp-2">
                        {milestone.milestone?.title || undefined}
                    </li>
                ))}
            </ul>
        ),
        enableHiding: true,
    },
    {
        accessorKey: "contacts",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Contacts" />
        ),
        cell: ({ row }) => (
            <ul className="flex flex-col gap-2">
                {row.original.contacts?.map((contact: any, index: number) => (
                    <li key={index}>
                        {contact.name || contact.email || contact.affiliation}
                    </li>
                ))}
            </ul>
        ),
        enableHiding: true,
    },
    {
        accessorKey: "links",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Links" />
        ),
        cell: ({ row }) => (
            <ul className="flex flex-col gap-2">
                {row.original.attachments?.map((attachment: any, index: number) => (
                    <li key={index} className="line-clamp-2">
                        {attachment.name || attachment.link}
                    </li>
                ))}
            </ul>
        ),
        enableHiding: true,
    },
    {
        accessorKey: "pinned",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Pinned"/>
        ),
        cell: ({ row }) => (
            <>
                {row.original.pinned ? <Pin fill="currentColor" className="h-4 w-4"/> : <Pin className="h-4 w-4"/>}
            </>
        ),
        enableHiding: true,
    },
  ]

  const actionsColumn: ColumnDef<any>[] = [
    {
        id: "actions",
        cell: ({ row }) => <AssetActionsMenu tool={row.original} type={'data'}/>,
        enableHiding: false,
    },
  ]

  return [...comendColumns, ...actionsColumn]
}
