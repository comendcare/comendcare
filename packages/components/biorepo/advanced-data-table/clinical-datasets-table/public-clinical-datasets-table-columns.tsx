"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CircleDashed,
  Text,
} from "lucide-react";
import * as React from "react";
import { DataTableColumnHeader } from "./../data-table/data-table-column-header";
import { TOOL_TYPE_OPTIONS } from "./../../../../../packages/lib/types";
import { MilestoneTypeBadge } from "./../../../milestone-type-badge";
import { ProfilePhoto } from "./../../../profile-photo";
import Link from "next/link";

export function useClinicalDatasetsTableColumns(): ColumnDef<any>[] {
  const comendColumns: ColumnDef<any>[] = [
    {
        id: "organization.name", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
                <Link
                    href={
                        process.env.NEXT_PUBLIC_VERCEL_ENV
                            ? `https://${row.original?.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                            : `http://${row.original?.organization?.subdomain}.localhost:3000`
                    }
                >
                    {row.original.organization?.name}
                </Link>
            </div>
        ),
    },
    {
        id: "sortId.id", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
        accessorKey: "id",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Dataset ID"/>
        ),
        cell: ({row}) => (
            <div className="flex gap-2 items-center">
                <p>{row.original.id || 'No Dataset ID'}</p>
            </div>
        ),
        enableHiding: true,
        meta: { label: "Dataset ID" }
    },
    {
      id: "title.title", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
        id: "type.label", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
        id: "cohortSize", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
        id: "condition.name", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
        id: "gene.symbol", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
        id: "institution.name", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
        enableSorting: false,
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
        enableSorting: false,
        enableHiding: true,
    },
  ]

  return comendColumns
}
