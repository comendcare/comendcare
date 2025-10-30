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
import { Badge } from "./../../../ui/badge";

type Preset = "default" | "profile";

function useColumnsPreset(explicit?: Preset) {
    const pathname = usePathname();
    if (explicit) return explicit;
    if (pathname?.startsWith("/app/profile")) return "profile";
    return "default";
}

export function useDiseaseModelsTableColumns(enableSorting: boolean = true, enableHiding: boolean = true, presetName?: Preset): ColumnDef<any>[] {
    const preset = useColumnsPreset(presetName);

    const columns: ColumnDef<any>[] = [
        {
            id: "sortId.id", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "id",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Model ID"
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.id || 'No Model ID'}</p>
                </div>
            ),
            enableHiding,
            enableSorting,
            meta: { label: "Model ID" }
        },
        {
            id: "type.label", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
                        const typeOption = DISEASE_MODEL_TYPE_OPTIONS.find(t => t.value === type)
                        return (
                            <MilestoneTypeBadge label={typeOption?.label} key={index}/>
                        )
                    })}
                </>
            ),
            enableHiding,
            enableSorting,
            enableColumnFilter: true,
            meta: {
                label: "Type",
                variant: "multiSelect",
                options: DISEASE_MODEL_TYPE_OPTIONS,
                icon: CircleDashed,
            },
        },
        {
            id: "strain.strain", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "strain",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Strain"
                />
            ),
            enableHiding,
            enableSorting,
            meta: {
                label: "Strain"
            }
        },
        {
            id: "condition.name", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
            id: "gene.symbol", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "gene",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Gene"
                />
            ),
            cell: ({row}) => (
                <>
                    {row.original.gene?.symbol && (
                        <Badge variant={"teal"}>
                            {row.original.gene.symbol}
                        </Badge>
                    )}
                </>
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
            id: "organization.name", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "organization",
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
            id: "institution.name", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "institution",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Stored with"
                />
            ),
            cell: ({row}) => {
                return (
                    <>
                    {(row.original.institution?.name || row.original.company?.title) && (
                        <Badge>
                            {row.original.institution?.name || row.original.company?.title}
                        </Badge>
                    )}
                    </>
                )
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
            enableSorting: false,
            enableHiding,
            meta: {
                label: "Point of contact"
            }
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
        {
            id: "description",
            accessorKey: "description",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Notes"
                />
            ),
            cell: ({row}) => (
                <div className="line-clamp-3">
                    {row.original.description}
                </div>
            ),
            enableSorting: false,
            enableHiding,
            meta: { label: "Notes" }
        },
    ]

    const presets: Record<Preset, string[]> = {
        default: columns.map((c) => c.id as string),
        profile: ["type.label", "contacts", "links", "gene.symbol", "genotype.genotype"],
    };

    const wanted = new Set(presets[preset]);
    return columns.filter((c) => wanted.has(c.id as string));
}
