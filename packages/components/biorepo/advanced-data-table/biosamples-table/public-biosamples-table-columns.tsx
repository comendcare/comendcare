import type {ColumnDef} from "@tanstack/react-table";
import * as React from "react";
import {DataTableColumnHeader} from "./../data-table/data-table-column-header";
import {BIOSAMPLE_TYPE_OPTIONS, DIAGNOSIS_SEVERITY_OPTIONS, QUANTITY_OPTIONS} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import { ProfilePhoto } from "./../../../profile-photo";
import Link from "next/link";
import { Badge } from "./../../../ui/badge";
import { CircleDashed } from "lucide-react";
import { handleAsyncCompanyAndInstitutionSearch, handleAsyncConditionSearch, handleAsyncDiagnosesSearch, handleAsyncGeneSearch, handleAsyncInstitutionSearch, handleAsyncOrganizationSearch } from "@comend/lib/utils";
import { ExtendedColumnFilter, ExtendedColumnSort } from "@comend/lib/types/data-table";
import { filterColumns } from "@comend/lib/filter-columns";
import { generateId } from "@comend/lib/id";

type Preset = "default" | "profile";

export function useBiosamplesTableColumns(
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
        // {
        //     id: typesenseSearch
        //         ? 'condition.name' // must match typesense accessor key (see biosampleSchema in sync.ts and /apps/web/api/sync/route.ts)
        //         : 'organization.conditions',
        //     accessorKey: "organization.conditions",
        //     header: ({column}) => (
        //         <DataTableColumnHeader 
        //             className="min-w-fit text-nowrap"
        //             column={column} 
        //             title="Condition"
        //         />
        //     ),
        //     cell: ({row}) => (
        //         <div className="flex gap-2 items-center">
        //             <p>{(row.original.organization?.conditions?.slice(0, 1) || []).map((condition: any) => condition?.condition?.name) || 'No Condition'}</p>
        //         </div>
        //     ),
        //     enableHiding,
        //     enableSorting: false,
        //     enableColumnFilter: true,
        //     meta: { 
        //         label: "Condition",
        //         variant: "multiSelect",
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true,
        //         dbAccessor: (filter: ExtendedColumnFilter<unknown>) => {
        //             const filters = [
        //                 {
        //                     ...filter,
        //                     ...(Array.isArray(filter.value) ? {value: filter.value.map(conditionOption => ({condition: {name: conditionOption}}))} : undefined),
        //                 } as any
        //             ]
        //             const results = filterColumns({
        //                 filters,
        //                 // join operator doesn't matter in this case because there will only be one entry in the list
        //                 joinOperator: 'or'
        //             })

        //             return results
        //         },
        //         // sortAccessor: (sort: ExtendedColumnSort<unknown>) => {
        //         //     const sortBy = {
        //         //         organization: {
        //         //             conditions: {
        //         //                 // where: { isPrimary: true },      // only consider primary condition
        //         //                 condition: { name: sort.desc ? "desc" : "asc" },
        //         //                 take: 1
        //         //             }
        //         //         }
        //         //     }
        //         //     return sortBy
        //         // },
        //         onAsyncSearch: handleAsyncConditionSearch
        //     }
        // },
        {
            id: "donor.diagnoses",
            accessorKey: "donor.diagnoses",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Diagnoses"
                />
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.donor?.diagnoses?.map((diagnosis: any, index: number) => {
                        const severityOption = DIAGNOSIS_SEVERITY_OPTIONS.find(option => option.value === diagnosis.severity)
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <Badge>
                                    {diagnosis?.type?.label} 
                                </Badge>
                                {severityOption && <Badge>{severityOption.label}</Badge>}
                            </li>
                        )
                    })}
                </ul>
            ),
            enableSorting: false,
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Diagnoses",
                variant: "multiSelect",
                // options: diagnosesOptions,
                showInAdvancedOnly: true,
                icon: CircleDashed,
                dbAccessor: (filter: ExtendedColumnFilter<unknown>) => {
                    const filters = [
                        {
                            ...filter,
                            ...(Array.isArray(filter.value) ? {value: filter.value.map(diagnosisOption => ({typeId: diagnosisOption}))} : undefined),
                        } as any
                    ]
                    const results = filterColumns({
                        filters,
                        // join operator doesn't matter in this case because there will only be one entry in the list
                        joinOperator: 'or'
                    })

                    return results
                },
                onAsyncSearch: handleAsyncDiagnosesSearch
            }
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
            enableHiding,
            enableSorting,
            meta: { label: "Genotype" }
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
                            ? `${row.original.quantity} ${QUANTITY_OPTIONS.find(option => option.value === row.original.quantityUnit)?.label || row.original.quantityUnit}`
                            : ``
                    }
                </>
            ),
            enableHiding,
            enableSorting,
            enableColumnFilter: true,
            meta: {
                label: "Total available quantity",
                variant: "range",
                range: [0, 1000],
                unitOptions: QUANTITY_OPTIONS,
                icon: CircleDashed,
                dbAccessor: (filter: ExtendedColumnFilter<unknown>) => {
                    const filters = [
                        filter,
                        {
                            id: 'quantityUnit',
                            value: filter.value[2],
                            variant: 'select' as any,
                            operator: 'eq' as any,
                            filterId: generateId({length: 8})
                        }
                    ]
                    const results = filterColumns({
                        filters,
                        joinOperator: 'and' // we want both of these itms to be true at the same time
                    })

                    return results
                },
            },
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
        profile: [
            "types", 
            "type.label", 
            "institution.name",
            "links", 
            "gene.symbol", 
            "genotype", 
            "genotype.genotype"
        ],
    };

    const wanted = new Set(presets[preset]);
    return columns.filter((c) => wanted.has(c.id as string));
}
