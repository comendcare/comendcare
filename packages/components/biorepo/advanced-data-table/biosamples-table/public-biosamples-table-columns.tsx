"use client";

import type {ColumnDef} from "@tanstack/react-table";
import {
    CircleDashed,
} from "lucide-react";
import * as React from "react";
import {
    DataTableColumnHeader
} from "./../data-table/data-table-column-header";
import {
    BIOSAMPLE_TYPE_OPTIONS,
    AVAILABILITY_OPTIONS
} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import { ProfilePhoto } from "./../../../profile-photo";
import { Badge } from "./../../../ui/badge";
import { Option } from "./../../../../../packages/lib/types";
import { handleGetAvailability } from "@comend/lib/utils";

export function useBiosamplesTableColumns(): ColumnDef<any>[] {

    const handleAsyncInstitutionSearch = async (query?: string | undefined): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input

        try {
            const response = await fetch(`/api/institutions?search=${query}`);
            const data = await response.json();

            // Return the fetched options
            return data.map((institution: Option) => ({label: institution.label, value: institution.label}));
        } catch (error) {
            console.error("Failed to fetch institutions:", error);
            return [];
        }
    };

    const handleAsyncGeneSearch = async (query?: string | undefined): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input

        try {
            const response = await fetch(`/api/genes?search=${query}`);
            const data = await response.json();

            // Return the fetched options
            return data;
        } catch (error) {
            console.error("Failed to fetch genes:", error);
            return [];
        }
    };

    const columns: ColumnDef<any>[] = [
        {
            id: "organization.name",
            accessorKey: "organization.name",
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
            id: "sortId.id", // must match typesense accessor key (see biosampleSchema in sync.ts)
            accessorKey: "id",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Sample ID"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.id || 'No Sample ID'}</p>
                </div>
            ),
            // enableSorting: false,
            enableHiding: true,
            meta: {
                label: "Sample ID"
            }
        },
        {
            id: "donor.id", // must match typesense accessor key (see biosampleSchema in sync.ts) 
            accessorKey: "donor.id",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Public Donor ID"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 min-w-[200px] items-center">
                    <img className="h-12 w-12 rounded-full" src={`https://api.dicebear.com/8.x/shapes/svg?seed=${row.original.donorId}`} alt="User Avatar" />
                    <p>{row.original.donorId}</p>
                </div>
            ),
            enableHiding: true,
            meta: {
                label: "Public Donor ID"
            }
        },
        {
            id: "type.label", // must match typesense accessor key (see biosampleSchema in sync.ts)
            accessorKey: "types",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Type"/>
            ),
            cell: ({row}) => (
                <>
                    {(row.original.types || []).map((type: string, index: number) => {
                        const typeOption = BIOSAMPLE_TYPE_OPTIONS.find(t => t.value === type)
                        return (
                            <MilestoneTypeBadge label={typeOption?.label} key={index}/>
                        )
                    })}
                </>
            ),
            enableHiding: true,
            meta: {
                label: "Type",
            },
        },
        {
            id: "condition.name", // must match typesense accessor key (see biosampleSchema in sync.ts)
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
            id: "gene.symbol", // must match typesense accessor key (see biosampleSchema in sync.ts)
            accessorKey: "gene.symbol",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Gene"/>
            ),
            cell: ({row}) => (
                <>{row.original.gene?.symbol}</>
            ),
            enableHiding: true,
            meta: {
                label: "Gene",
            }
        },
        {
            id: "availability.value", // must match typesense accessor key (see biosampleSchema in sync.ts)
            accessorKey: "availability",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Availability"/>
            ),
            cell: ({row}) => {
                const availability = handleGetAvailability(row.original)
                if (availability !== undefined) {
                    return <Badge variant={availability.variant}>{availability.value}</Badge>
                }
                return <></>
            },
            enableHiding: true,
            meta: {
                label: "Availability",
            }
        },
        {
            // NOTE: in order for filters to access the proper nested database object the path to
            // the nested object must be defined in BOTH the id & accessorKey
            id: "quantity", // must match typesense accessor key (see biosampleSchema in sync.ts)
            accessorKey: "quantity",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Available Quantity"/>
            ),
            cell: ({row}) => (
                <>
                    {
                        (row.original.quantity && row.original.quantityUnit && row.original.quantity >= 0 )
                            ? `${row.original.quantity}${row.original.quantityUnit}`
                            : `unknown`
                    }
                </>
            ),
            enableHiding: true,
            meta: {
                label: "Available Quantity"
            },
        },
        {
            id: "institution.name",
            accessorKey: "institution.name",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Storage Facility"/>
            ),
            cell: ({row}) => {
                return <>{row.original.institution?.name}</>
            },
            enableHiding: true,
            meta: {
                label: "Storage Facility",
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
            enableSorting: false,
            enableHiding: true,
            meta: {
                label: "Links"
            }
        },
        // {
        //     id: "description",
        //     accessorKey: "description",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Other Notes"/>
        //     ),
        //     cell: ({row}) => (
        //         <div className="line-clamp-3">
        //             {row.original.description}
        //         </div>
        //     ),
        //     meta: {
        //         label: "Other Notes"
        //     },
        //     enableHiding: true,
        // },
    ]

    return columns
}
