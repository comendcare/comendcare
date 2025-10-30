"use client";

import type {ColumnDef} from "@tanstack/react-table";
import * as React from "react";
import {DataTableColumnHeader} from "./../data-table/data-table-column-header";
import {BIOSAMPLE_TYPE_OPTIONS} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import { ProfilePhoto } from "./../../../profile-photo";
import Link from "next/link";
import {usePathname} from "next/navigation";

type Preset = "default" | "profile";

function useColumnsPreset(explicit?: Preset) {
    const pathname = usePathname();
    if (explicit) return explicit;
    if (pathname?.startsWith("/app/profile")) return "profile";
    return "default";
}

export function useBiosamplesTableColumns(enableSorting: boolean = true, enableHiding: boolean = true, presetName?: Preset): ColumnDef<any>[] {
    const preset = useColumnsPreset(presetName);

    const columns: ColumnDef<any>[] = [
        {
            id: "sortId.id", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "id",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Sample ID"
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center min-w-fit text-nowrap">
                    <p>{row.original.id || 'No Sample ID'}</p>
                </div>
            ),
            enableHiding,
            enableSorting,
            meta: { label: "Sample ID" }
        },
        {
            id: "donor.id", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "donor.id",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="text-nowrap"
                    column={column} 
                    title="Donor ID"
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center min-w-[110px] text-nowrap">
                    <img className="size-8 rounded-full" src={`https://api.dicebear.com/8.x/shapes/svg?seed=${row.original.donorId}`} alt="User Avatar" />
                    <p>{row.original.donorId}</p>
                </div>
            ),
            enableHiding,
            enableSorting,
            meta: { label: "Donor ID" },
        },
        {
            id: "type.label", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "types",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Type"
                />
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
            enableHiding,
            enableSorting,
            meta: { label: "Type" }
        },
        {
            id: "condition.name", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "condition",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Condition"
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{(row.original.organization?.conditions || []).map((condition: any) => condition.condition.name) || 'No Condition'}</p>
                </div>
            ),
            enableHiding,
            enableSorting,
            meta: { label: "Condition" }
        },
        {
            id: "gene.symbol", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "gene.symbol",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Gene"
                />
            ),
            cell: ({row}) => (
                <>{row.original.gene?.symbol}</>
            ),
            enableHiding,
            enableSorting,
            meta: { label: "Gene" }
        },
        {
            id: "genotype.genotype", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "genotype",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Genotype"
                />
            ),
            enableHiding,
            enableSorting,
            meta: {
                label: "Genotype"
            }
        },
        {
            id: "organization.name", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "organization.name",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Associated patient group"
                />
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
            enableHiding,
            enableSorting,
        },
        {
            id: "quantity", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "quantity",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Total available quantity"
                />
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
                            : ``
                    }
                </>
            ),
            enableHiding,
            enableSorting,
            meta: { label: "Inventory" }
        },
        {
            id: "institution.name", // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "institution.name",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Stored with"
                />
            ),
            cell: ({row}) => {
                return <>{row.original.institution?.name || row.original.company?.title}</>
            },
            enableHiding,
            enableSorting,
            meta: { label: "Stored with" }
        },
        {
            id: "contacts",
            accessorKey: "contacts",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Point of contact"
                />
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
            enableHiding,
            enableSorting: false,
            meta: { label: "Point of contact" }
        },
        {
            id: "links",
            accessorKey: "links",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Links"
                />
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.attachments?.map((attachment: any, index: number) => (
                        <li key={index}>
                            <Link 
                                className="line-clamp-2 underline" 
                                href={attachment.link || "/"}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                            >
                            {attachment.name || attachment.link}
                            </Link>
                        </li>
                    ))}
                </ul>
            ),
            enableSorting: false,
            enableHiding,
            meta: { label: "Links" }
        },
    ]

    const presets: Record<Preset, string[]> = {
        default: columns.map((c) => c.id as string),
        profile: ["type.label", "contacts", "links", "gene.symbol", "genotype.genotype"],
    };

    const wanted = new Set(presets[preset]);
    return columns.filter((c) => wanted.has(c.id as string));
}
