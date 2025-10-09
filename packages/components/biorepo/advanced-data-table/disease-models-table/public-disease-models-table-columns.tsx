"use client";

import type {ColumnDef} from "@tanstack/react-table";
import {CircleDashed} from "lucide-react";
import * as React from "react";
import {DataTableColumnHeader} from "./../data-table/data-table-column-header";
import {DISEASE_MODEL_TYPE_OPTIONS} from "./../../../../../packages/lib/types";
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

export function useDiseaseModelsTableColumns(presetName?: Preset): ColumnDef<any>[] {
    const preset = useColumnsPreset(presetName);

    const columns: ColumnDef<any>[] = [
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
                        className="underline"
                    >
                        {row.original.organization?.name}
                    </Link>
                </div>
            ),
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
        },
        {
            id: "sortId.id", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "id",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Model ID"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.id || 'No Model ID'}</p>
                </div>
            ),
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            meta: { label: "Model ID" }
        },
        {
            id: "type.label", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            enableColumnFilter: true,
            meta: {
                label: "Type",
                variant: "multiSelect",
                options: DISEASE_MODEL_TYPE_OPTIONS,
                icon: CircleDashed,
            },
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
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            meta: { label: "Condition" }
        },
        {
            id: "strain.strain", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "strain",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Strain"/>
            ),
            enableHiding: preset !== 'profile',
            enableSorting: preset !== 'profile',
            meta: {
                label: "Strain"
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
        {
            id: "institution.name", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "institution",
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
            enableSorting: false,
            enableHiding: preset !== 'profile',
            meta: {
                label: "Point of Contact"
            }
        },
        {
            id: "links",
            accessorKey: "links",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Links"/>
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2 min-w-[120px]">
                    {row.original.attachments?.map((attachment: any, index: number) => (
                        <li key={index}>
                            <Link 
                                className="line-clamp-2 underline" 
                                href={attachment.link || "/"}
                                onClick={(e) => e.stopPropagation()}
                            >
                            {attachment.name || attachment.link}
                            </Link>
                        </li>
                    ))}
                </ul>
            ),
            enableSorting: false,
            enableHiding: preset !== 'profile',
            meta: { label: "Links" }
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
            enableSorting: false,
            enableHiding: preset !== 'profile',
            meta: { label: "Description" }
        },
    ]

    const presets: Record<Preset, string[]> = {
        default: columns.map((c) => c.id as string),
        profile: ["type.label", "contacts", "links", "gene.symbol", "genotype.genotype"],
    };

    const wanted = new Set(presets[preset]);
    return columns.filter((c) => wanted.has(c.id as string));
}
