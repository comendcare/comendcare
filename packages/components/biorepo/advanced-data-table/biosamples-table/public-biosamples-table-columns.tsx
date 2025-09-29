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
import Link from "next/link";

export function useBiosamplesTableColumns(): ColumnDef<any>[] {

    const handleGetAvailability = (sample: any): {value: string, variant: 'green' | 'yellow' | 'red'} | undefined => {
        if (sample?.quantity !== null) {
            if (sample.quantity > 0) {
                if (sample?.materialAndDataAccessRequests?.length > 0) {
                    return {value: 'Reserved', variant: 'yellow'}
                }
                return {value: 'Available', variant: 'green'}
            }
            if (sample.quantity <= 0) return {value: 'Depleted', variant: 'red'}
        }

        return undefined
    }

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
            id: "donorId",
            accessorKey: "donorId",
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
            id: "types",
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
            enableColumnFilter: true,
            meta: {
                label: "Type",
                variant: "multiSelect",
                options: BIOSAMPLE_TYPE_OPTIONS,
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
            enableColumnFilter: true,
            meta: {
                label: "Gene",
                variant: "select",
                icon: CircleDashed,
                showInAdvancedOnly: true,
                onAsyncSearch: handleAsyncGeneSearch
            }
        },
        {
            id: "availability",
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
            enableColumnFilter: true,
            meta: {
                label: "Availability",
                variant: "select",
                options: AVAILABILITY_OPTIONS,
                icon: CircleDashed,
                showInAdvancedOnly: true
            }
        },
        {
            // NOTE: in order for filters to access the proper nested database object the path to
            // the nested object must be defined in BOTH the id & accessorKey
            id: "quantity",
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
            enableColumnFilter: true,
            meta: {
                label: "Available Quantity",
                variant: "range",
                range: [0, 1000],
                unit: 'ml',
            },
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
            enableColumnFilter: true,
            meta: {
                label: "Storage Facility",
                variant: "select",
                icon: CircleDashed,
                showInAdvancedOnly: true,
                onAsyncSearch: handleAsyncInstitutionSearch
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
                <DataTableColumnHeader column={column} title="Other Notes"/>
            ),
            cell: ({row}) => (
                <div className="line-clamp-3">
                    {row.original.description}
                </div>
            ),
            meta: {
                label: "Other Notes"
            },
            enableHiding: true,
        },
    ]

    return columns
}
