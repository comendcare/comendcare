"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CircleDashed,
  Text,
} from "lucide-react";
import * as React from "react";
import { DataTableColumnHeader } from "@comend/components/biorepo/advanced-data-table/data-table/data-table-column-header";
import { TOOL_TYPE_OPTIONS } from "@comend/lib/types";
import { MilestoneTypeBadge } from "@comend/components/milestone-type-badge";
import { ProfilePhoto } from "@comend/components/profile-photo";

export function useClinicalDatasetsTableColumns(): ColumnDef<any>[] {
  const comendColumns: ColumnDef<any>[] = [
    {
        id: "organization",
        accessorKey: "organization",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Organization"/>
        ),
        cell: ({row}) => (
            <div className="flex gap-2 items-center w-[150px]">
                <ProfilePhoto
                    img={row.original?.organization?.image}
                    name={row.original?.organization?.name}
                    className="size-8"
                />
                {row.original.organization?.name}
            </div>
        ),
    },
    {
        id: "id",
        accessorKey: "id",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Tool ID"/>
        ),
        cell: ({row}) => (
            <div className="flex gap-2 items-center">
                <p>{row.original.id || 'No Tool ID'}</p>
            </div>
        ),
        enableHiding: true,
        meta: {
            label: "Tool ID"
        }
    },
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
        id: "types",
        accessorKey: "types",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
          <>
            {(row.original.types || []).map((type: string) => {
              const typeOption = TOOL_TYPE_OPTIONS.find(t => t.value === type)
              return (
                <MilestoneTypeBadge label={typeOption?.label}/>
              )
            })}
          </>
        ),
        enableHiding: true,
        enableColumnFilter: true,
        meta: {
          label: "Type",
          variant: "multiSelect",
          options: TOOL_TYPE_OPTIONS,
          icon: CircleDashed,
        },
    },
    {
        id: "cohortSize",
        accessorKey: "cohortSize",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Cohort Size"/>
        ),
        cell: ({row}) => (
            <>{
                (row.original.cohortSize !== null && row.original.cohortSize !== undefined)
                    ? row.original.cohortSize
                    : ''
            }</>
        ),
        enableHiding: true,
        meta: {
            label: "Cohort Size"
        }
    },
    {
        id: "condition",
        accessorKey: "condition",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Condition"/>
        ),
        cell: ({row}) => (
            <div className="flex gap-2 items-center">
                <p>{(row.original.organization?.conditions || []).map((condition: any) => condition.condition.name) || 'No Condition'}</p>
            </div>
        ),
        enableHiding: true,
        meta: {
            label: "Condition"
        }
    },
    {
        id: "gene",
        accessorKey: "gene",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Gene"/>
        ),
        cell: ({row}) => (
            <>{row.original.gene?.symbol}</>
        ),
        enableHiding: true,
        meta: {
            label: "Gene"
        }
    },
    {
        id: "institution",
        accessorKey: "institution",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Storage Facility"/>
        ),
        cell: ({row}) => {
            // if (row.original.institution?.website && row.original.institution?.name) {
            //     return (
            //         <Link className="underline" href={row.original.institution?.website}>
            //             {row.original.institution?.name}
            //         </Link>
            //     )
            // }
            // if (row.original.institution?.name) return (<>{row.original.institution?.name}</>)
            // return <></>
            return <>{row.original.institution?.name}</>
        },
        enableHiding: true,
        meta: {
            label: "Storage Facility"
        }
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
    },
  ]

  return comendColumns
}
