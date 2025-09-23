"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CircleDashed,
  Globe,
  Lock,
  Text,
} from "lucide-react";
import * as React from "react";
import { DataTableColumnHeader } from "./../data-table/data-table-column-header";
import { TOOL_TYPE_OPTIONS } from "./../../../../../packages/lib/types";
import { MilestoneTypeBadge } from "./../../../milestone-type-badge";
import { AssetActionsMenu } from "comend-pag-platform/components/tool-actions-menu";
import { Checkbox } from "./../../../ui/checkbox";

export function getClinicalDatasetsTableColumns(): ColumnDef<any>[] {
  const columns: ColumnDef<any>[] = [
    {
        id: "select",
        header: ({ table }) => (
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
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { label: "Select" }
    },
    {
        id: "private",
        accessorKey: "private",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Visibility"/>
        ),
        cell: ({row}) => (
            <div>
                {row.getValue("private") 
                    ? (
                        <div className="flex gap-1 items-center">
                            <Lock className="h-4 w-4"/>
                            Private
                        </div>
                    )
                    : (
                        <div className="flex gap-1 items-center">
                            <Globe className="h-4 w-4"/>
                            Published
                        </div>
                    )
                }
            </div>
        ),
        enableHiding: true,
        enableColumnFilter: true,
        meta: {
            label: "Visibility",
            variant: "select",
            options: [
                {
                    label: "Private",
                    value: "true",
                }, {
                    label: "Published",
                    value: "false",
                }
            ],
            icon: CircleDashed,
        },
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
      },
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
    // {
    //     id: "patientId",
    //     accessorKey: "patientId",
    //     header: ({column}) => (
    //         <DataTableColumnHeader column={column} title="Linked Patient ID"/>
    //     ),
    //     enableHiding: true,
    //     meta: {
    //         label: "Linked Patient ID",
    //     }
    // },
    // {
    //     id: "availability",
    //     accessorKey: "availability",
    //     header: ({column}) => (
    //         <DataTableColumnHeader column={column} title="Availability"/>
    //     ),
    //     enableHiding: true,
    //     enableColumnFilter: true,
    //     meta: {
    //         label: "Availability",
    //     }
    // },
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
        accessorKey: "contacts",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Point of Contact" />
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

    // {
    //     id: "condition",
    //     accessorKey: "condition",
    //     header: ({column}) => (
    //         <DataTableColumnHeader column={column} title="Condition"/>
    //     ),
    //     cell: ({row}) => (
    //         <div className="flex gap-2 items-center">
    //             <p>{(row.original.organization?.conditions || []).map((condition: any) => condition.condition.name) || 'No Condition'}</p>
    //         </div>
    //     ),
    //     enableHiding: true,
    //     meta: {
    //         label: "Condition"
    //     }
    // },
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
    {
        id: "actions",
        cell: ({ row }) => <AssetActionsMenu tool={row.original} type={'data'}/>,
        enableHiding: false,
    },
  ]

  return columns
}
