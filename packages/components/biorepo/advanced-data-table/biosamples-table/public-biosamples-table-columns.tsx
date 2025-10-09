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
import { handleGetAvailability } from "./../../../../../packages/lib/utils";
import {usePathname} from "next/navigation";

type Preset = "default" | "profile";

function useColumnsPreset(explicit?: Preset) {
    const pathname = usePathname();
    if (explicit) return explicit;
    if (pathname?.startsWith("/app/profile")) return "profile";
    return "default";
}

export function useBiosamplesTableColumns(presetName?: Preset): ColumnDef<any>[] {
    const preset = useColumnsPreset(presetName);

    const columns: ColumnDef<any>[] = [
        {
            id: "organization.name", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
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
                    <Link
                        href={
                            process.env.NEXT_PUBLIC_VERCEL_ENV
                                ? `https://${row.original?.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                                : `http://${row.original?.organization?.subdomain}.localhost:3000`
                        }
                        className="underline"
                    >
                        {row.original.organization?.name}
                    </Link>
                </div>
            ),
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile'
        },
        {
            id: "donor.id", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
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
            enableHiding: preset !== 'profile',
            meta: { label: "Public Donor ID" },
            enableSorting: preset !== 'profile'
        },
        {
            id: "sortId.id", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "id",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Sample ID"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.id || 'No Sample ID'}</p>
                </div>
            ),
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            meta: { label: "Sample ID" }
        },
        {
            id: "type.label", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
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
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            meta: { label: "Type" }
        },
        {
            id: "condition.name", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "condition",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Condition"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{(row.original.organization?.conditions || []).map((condition: any) => condition.condition.name) || 'No Condition'}</p>
                </div>
            ),
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            meta: { label: "Condition" }
        },
        {
            id: "gene.symbol", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "gene.symbol",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Gene"/>
            ),
            cell: ({row}) => (
                <>{row.original.gene?.symbol}</>
            ),
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            meta: { label: "Gene" }
        },
        {
            id: "genotype.genotype", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "genotype",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Genotype"/>
            ),
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            meta: {
                label: "Genotype"
            }
        },
        // {
        //     id: "availability.value", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
        //     accessorKey: "availability",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Availability Status"/>
        //     ),
        //     cell: ({row}) => {
        //         const availability = handleGetAvailability(row.original)
        //         if (availability !== undefined) {
        //             return <Badge variant={availability.variant}>{availability.value}</Badge>
        //         }
        //         return <></>
        //     },
        //     enableHiding: true,
        //     meta: { label: "Availability Status" }
        // },
        {
            id: "quantity", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "quantity",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Available Quantity"/>
            ),
            cell: ({row}) => (
                <>
                    {
                        (
                            row.original.quantity !== null && 
                            row.original.quantity !== undefined && 
                            row.original.quantityUnit && 
                            row.original.quantity >= 0 
                        )
                            ? `${row.original.quantity}${row.original.quantityUnit}`
                            : `unknown`
                    }
                </>
            ),
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            meta: { label: "Available Quantity" }
        },
        {
            id: "institution.name", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "institution.name",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Storage Facility"/>
            ),
            cell: ({row}) => {
                return <>{row.original.institution?.name}</>
            },
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            meta: { label: "Storage Facility" }
        },
        {
            id: "contacts",
            accessorKey: "contacts",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Point of Contact"/>
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.contacts?.map((contact: any, index: number) => (
                        <li key={index}>
                            {contact.name || contact.email || contact.affiliation}
                        </li>
                    ))}
                </ul>
            ),
            enableHiding: preset !== 'profile',
            enableSorting: false,
            meta: { label: "Point of Contact" }
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
            enableHiding: preset !== 'profile',
            meta: { label: "Links" }
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

    const presets: Record<Preset, string[]> = {
        default: columns.map((c) => c.id as string),
        profile: ["type.label", "contacts", "links", "gene.symbol", "genotype.genotype"],
    };

    const wanted = new Set(presets[preset]);
    return columns.filter((c) => wanted.has(c.id as string));
}
