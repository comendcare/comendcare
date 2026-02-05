import type {ColumnDef} from "@tanstack/react-table";
import {CircleDashed} from "lucide-react";
import * as React from "react";
import {DataTableColumnHeader} from "./../data-table/data-table-column-header";
import {DISEASE_MODEL_TYPE_OPTIONS} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import { ProfilePhoto } from "./../../../profile-photo";
import Link from "next/link";
import { Badge } from "./../../../ui/badge";
import { handleAsyncCompanyAndInstitutionSearch, handleAsyncConditionSearch, handleAsyncGeneSearch, handleAsyncInstitutionSearch, handleAsyncOrganizationSearch } from "@comend/lib/utils";
import { ExtendedColumnFilter } from "@comend/lib/types/data-table";
import { filterColumns } from "@comend/lib/filter-columns";
import { generateId } from "@comend/lib/id";
import { SeeMoreDescription } from "./../../../../../packages/components/see-more-description";

type Preset = "default" | "profile";

export function useDiseaseModelsTableColumns(
    enableSorting: boolean = true, 
    enableHiding: boolean = true, 
    typesenseSearch: boolean = true,
    presetName?: Preset,
): ColumnDef<any>[] {
     const preset = presetName || 'default'

    const columns: ColumnDef<any>[] = [
        {
            id: typesenseSearch
                ? 'sortId.id' // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
                : 'id',
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
                    <p>{row.original.id || '--'}</p>
                </div>
            ),
            enableHiding,
            enableSorting,
            meta: { label: "Model ID" }
        },
        {
            id: typesenseSearch
                ? 'type.label' // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
                : 'types',
            accessorKey: "types",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Type"
                />
            ),
            cell: ({row}) => {
                const options = DISEASE_MODEL_TYPE_OPTIONS.filter(option => row.original.types?.includes(option.value))
                return (
                    (options && options.length > 0)
                        ? (options.map((option, index) => <MilestoneTypeBadge label={option?.label} key={index}/>))
                        : (<p>{'--'}</p>)
                )
            },
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
            id: typesenseSearch
                ? 'strain.strain' // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
                : 'strain',
            accessorKey: "strain",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Strain"
                />
            ),
            cell: ({row}) => (
                <p>{row.original.strain || '--'}</p>
            ),
            enableHiding,
            enableSorting,
            meta: { label: "Strain" }
        },
        {
            id: typesenseSearch
                ? 'condition.name' // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
                : 'organization.conditions',
            accessorKey: "organization.conditions",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Condition"
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{(row.original.organization?.conditions || []).map((condition: any) => condition.condition.name) || '--'}</p>
                </div>
            ),
            enableHiding,
            enableSorting: false, // cannot sort since the org can attatch multiple conditions
            enableColumnFilter: true,
            meta: { 
                label: "Condition",
                variant: "multiSelect",
                icon: CircleDashed,
                showInAdvancedOnly: true,
                dbAccessor: (filter: ExtendedColumnFilter<unknown>) => {
                    const filters = [
                        {
                            ...filter,
                            ...(Array.isArray(filter.value) ? {value: filter.value.map(conditionOption => ({condition: {name: conditionOption}}))} : undefined),
                        } as any
                    ]
                    const results = filterColumns({
                        filters,
                        // join operator doesn't matter in this case because there will only be one entry in the list
                        joinOperator: 'or'
                    })

                    return results
                },
                onAsyncSearch: handleAsyncConditionSearch
            }
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
            cell: ({row}) => {
                const gene = row.original.gene?.symbol
                return (
                    (gene && gene.length > 0)
                        ? (
                            <Badge variant={"teal"}>
                                {gene}
                            </Badge>
                        )
                        : (<p>{'--'}</p>)
                )
            },
            enableHiding,
            enableSorting,
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
            id: typesenseSearch
                ? 'genotype.genotype' // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
                : 'genotype',
            // id: "genotype.genotype", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
            accessorKey: "genotype",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Genotype"
                />
            ),
            cell: ({row}) => (
                <p>{row.original.genotype || '--'}</p>
            ),
            enableHiding,
            enableSorting,
            meta: { label: "Genotype" }
        },
        {
            id: "organization.name", // must match typesense accessor key (see diseaseModelSchema in sync.ts and /apps/web/api/sync/route.ts)
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
            enableColumnFilter: true,
            meta: { 
                label: "Associated patient group",
                variant: "select",
                icon: CircleDashed,
                showInAdvancedOnly: true,
                onAsyncSearch: handleAsyncOrganizationSearch
            }
        },
        {
            id: typesenseSearch
                ? 'institution.name' // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
                : 'institution.name',
            accessorKey: "institution.name",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Stored with"
                />
            ),
            cell: ({row}) => {
                const institution = row.original.institution?.name
                const company = row.original.company?.title
                return (
                    (institution || company)
                        ? (
                            <Badge>
                                {institution || company}
                            </Badge>
                        )
                        : (<p>{'--'}</p>)
                )
            },
            enableHiding,
            enableSorting: false,
            enableColumnFilter: true,
            meta: {
                label: "Stored with",
                variant: "select",
                icon: CircleDashed,
                showInAdvancedOnly: true,
                dbAccessor: (filter: ExtendedColumnFilter<unknown>) => {
                    const filters = [
                        filter,
                        {
                            ...filter,
                            id: 'company.title',
                            filterId: generateId({length: 8})
                        }
                    ]
                    const results = filterColumns({
                        filters,
                        joinOperator: 'or'
                    })

                    return results
                },
                onAsyncSearch: handleAsyncCompanyAndInstitutionSearch
            }
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
            cell: ({row}) => {
                const contacts = row.original.contacts
                return (
                    (contacts && contacts.length > 0)
                        ? (
                            <ul className="flex flex-col gap-2">
                                {row.original.contacts?.map((contact: any, index: number) => (
                                    <li key={index}>
                                        {contact.name || contact.email || contact.affiliation}
                                    </li>
                                ))}
                            </ul>
                        )
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting: false,
            enableHiding,
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
            cell: ({row}) => {
                const attachments = row.original.attachments
                return (
                    (attachments && attachments.length > 0)
                        ? (
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
                        )
                        : (<p>{'--'}</p>)
                )
            },
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
            cell: ({row}) => {
                const description = row.original.description
                return (
                    (description && description.length > 0)
                        ? (<div className="w-fit min-w-[500px]"><SeeMoreDescription description={description}/></div>)
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting: false,
            enableHiding,
            meta: { label: "Notes" }
        },
    ]

    const presets: Record<Preset, string[]> = {
        default: columns.map((c) => c.id as string),
        profile: [
            "types", 
            "type.label", 
            "institution.name",
            "links", 
            "gene.symbol", 
            "genotype.genotype", 
            "genotype"
        ],
    };

    const wanted = new Set(presets[preset]);
    return columns.filter((c) => wanted.has(c.id as string));
}
