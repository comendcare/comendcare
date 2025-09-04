"use client";

import type {ColumnDef} from "@tanstack/react-table";
import {CircleDashed} from "lucide-react";
import * as React from "react";
import {DataTableColumnHeader} from "./../data-table/data-table-column-header";
import {DISEASE_MODEL_TYPE_OPTIONS} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import { ProfilePhoto } from "./../../../profile-photo";

export function useDiseaseModelsTableColumns(): ColumnDef<any>[] {
    const columns: ColumnDef<any>[] = [
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
                <DataTableColumnHeader column={column} title="Sample ID"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.id || 'No Sample ID'}</p>
                </div>
            ),
            enableHiding: true,
            meta: {
                label: "Sample ID"
            }
        },
        {
            id: "types",
            accessorKey: "types",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Type"/>
            ),
            cell: ({row}) => (
                <>
                    {(row.original.types || []).map((type: string, index: number) => {
                        const typeOption = DISEASE_MODEL_TYPE_OPTIONS.find(t => t.value === type)
                        return (
                            <MilestoneTypeBadge label={typeOption?.label} key={index}/>
                        )
                    })}
                </>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Type",
                variant: "multiSelect",
                options: DISEASE_MODEL_TYPE_OPTIONS,
                icon: CircleDashed,
            },
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
                return <>{row.original.institution?.name}</>
            },
            enableHiding: true,
            meta: {
                label: "Storage Facility"
            }
        },
        {
            id: "links",
            accessorKey: "links",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Links"/>
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.attachments?.map((attachment: any, index: number) => (
                        <li key={index} className="line-clamp-2">
                            {attachment.name || attachment.link}
                        </li>
                    ))}
                </ul>
            ),
            enableHiding: true,
            meta: {
                label: "Links"
            }
        },
        {
            id: "description",
            accessorKey: "description",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Description"/>
            ),
            cell: ({row}) => (
                <div className="line-clamp-3">
                    {row.original.description}
                </div>
            ),
            meta: {
                label: "Description"
            },
            enableHiding: true,
        },
    ]

    return columns
}
