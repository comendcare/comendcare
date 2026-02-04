import type {ColumnDef} from "@tanstack/react-table";
import {
    CircleDashed,
    FileText,
    Globe,
    Info,
    Lock,
} from "lucide-react";
import * as React from "react";
import {
    DataTableColumnHeader
} from "./../data-table/data-table-column-header";
import {
    AVAILABILITY_OPTIONS,
    BIOSAMPLE_TYPE_OPTIONS,
    DIAGNOSIS_SEVERITY_OPTIONS,
    DONOR_RACE_OPTIONS,
    DONOR_SEX_OPTIONS,
    Milestone,
    QUANTITY_OPTIONS,
} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import {AssetActionsMenu} from "comend-pag-platform/components/tool-actions-menu";
import { Badge } from "./../../../ui/badge";
import { Checkbox } from "./../../../ui/checkbox";
import { getDiagnosisTypes } from "./../../../../../packages/lib/fetchers";
import { useEffect, useState } from "react";
import { Option } from "./../../../../../packages/lib/types";
import { handleAsyncCompanyAndInstitutionSearch, handleAsyncCompanySearch, handleAsyncDiagnosesSearch, handleAsyncGeneSearch, handleAsyncInstitutionSearch, handleAsyncMilestoneSearch, handleGetAvailability } from "./../../../../../packages/lib/utils";
import { getSession, useSession } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./../../../ui/tooltip";
import Link from "next/link";
import { filterColumns } from "@comend/lib/filter-columns";
import { generateId } from "@comend/lib/id";
import { ExtendedColumnFilter } from "@comend/lib/types/data-table";
import { Session } from "next-auth";

export function useBiosamplesTableColumns({session}: {session: Session | null}): ColumnDef<any>[] {
    const columns: ColumnDef<any>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <div className="-ml-1 pr-1">
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                        className="translate-y-[2px]"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div
                    onClick={(e) => {
                        e.stopPropagation(); // prevent row onClick from firing
                    }}
                >
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            meta: { label: "Select" }
        },
        {
            id: "private",
            accessorKey: "private",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Visibility"
                />
            ),
            cell: ({row}) => (
                <div>
                    {row.getValue("private") 
                        ? (
                            <div className="flex gap-1 items-center">
                                <Lock className="h-4 w-4"/>
                                Private
                            </div>
                        )
                        : (
                            <div className="flex gap-1 items-center">
                                <Globe className="h-4 w-4"/>
                                Published
                            </div>
                        )
                    }
                </div>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Visibility",
                variant: "select",
                options: [
                    {
                        label: "Private",
                        value: "true",
                    }, {
                        label: "Published",
                        value: "false",
                    }
                ],
                icon: CircleDashed,
                dbAccessor: (filter: ExtendedColumnFilter<unknown>) => {
                    const filters = [
                        {
                            ...filter,
                            ...({value: filter.value === "true" ? true : false}),
                        } as any
                    ]
                    const results = filterColumns({
                        filters,
                        // join operator doesn't matter in this case because there will only be one entry in the list
                        joinOperator: 'or'
                    })

                    return results
                },
            },
        },
        {
            id: "donorId",
            accessorKey: "donorId",
            header: ({column}) => (
                <DataTableColumnHeader 
                    column={column} 
                    className="min-w-fit text-nowrap"
                    title="Public donor ID"
                    tooltip="This is a unique, public de-identified ID. It will appear in the marketplace.."
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <img className="size-8 rounded-full" src={`https://api.dicebear.com/8.x/shapes/svg?seed=${row.original.donorId}`} alt="User Avatar" />
                    <p>{row.original.donorId}</p>
                </div>
            ),
            enableHiding: true,
            meta: { label: "Public donor ID" }
        },
        {
            id: "donor.internalId",
            accessorKey: "donor.internalId",
            header: ({ column }) => (
                <DataTableColumnHeader 
                    column={column} 
                    className="min-w-fit text-nowrap"
                    title="Internal donor ID" 
                    tooltip="Optional internal ID for your organization’s tracking system. Not guaranteed to be unique or visible outside your organization."
                />
            ),
            enableHiding: true,
            enableSorting: false,
            meta: { label: "Internal donor ID" }
        },
        {
            id: "id",
            accessorKey: "id",
            header: ({column}) => (
                <DataTableColumnHeader 
                    column={column} 
                    title="Sample ID"
                    className="min-w-fit text-nowrap"
                    tooltip="Unique ID assigned to this sample. This ID is public and appears in the marketplace."
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.id || 'No Sample ID'}</p>
                </div>
            ),
            enableHiding: true,
            meta: { label: "Sample ID" }
        },
        {
            id: "types",
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
        {
            id: "gene.symbol",
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
            id: "genotype",
            accessorKey: "genotype",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Genotype"
                />
            ),
            enableHiding: true,
            meta: { label: "Genotype" }
        },
        {
            id: "bsiId",
            accessorKey: "bsiId",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="BSI ID"
                />
            ),
            enableHiding: true,
            meta: { label: "BSI ID" }
        },
        {
            id: "donor.sex",
            accessorKey: "donor.sex",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Sex"
                />
            ),
            cell: ({row}) => (
                <>
                    {DONOR_SEX_OPTIONS.find(t => t.value === row.original.donor?.sex)?.label && (
                        <Badge>
                            {DONOR_SEX_OPTIONS.find(t => t.value === row.original.donor?.sex)?.label}
                        </Badge>
                    )}
                </>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            enableSorting: false,
            meta: {
                label: "Sex",
                variant: "select",
                options: DONOR_SEX_OPTIONS,
                icon: CircleDashed,
                showInAdvancedOnly: true,
            }
        },
        {
            id: "donor.race",
            accessorKey: "donor.race",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Race"
                />
            ),
            cell: ({row}) => (
                <>
                    {DONOR_RACE_OPTIONS.find(t => t.value === row.original.donor?.race)?.label && (
                        <Badge>
                            {DONOR_RACE_OPTIONS.find(t => t.value === row.original.donor?.race)?.label}
                        </Badge>
                    )}
                </>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            enableSorting: false,
            meta: {
                label: "Race",
                variant: "select",
                options: DONOR_RACE_OPTIONS,
                icon: CircleDashed,
                showInAdvancedOnly: true
            }
        },
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
            // NOTE: in order for filters to access the proper nested database object the path to
            // the nested object must be defined in BOTH the id & accessorKey
            id: "quantity",
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
            enableHiding: true,
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
            id: 'institution.name',
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
            enableHiding: true,
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
            enableSorting: false,
            enableHiding: true,
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
                                className="line-clamp-1 underline text-ellipsis text-nowrap" 
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
            enableHiding: true,
            meta: { label: "Links" }
        },
        {
            id: "milestones",
            accessorKey: "milestones",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="text-nowrap"
                    column={column} 
                    title="Linked projects"
                />
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.milestones?.map((milestone: any, index: number) => (
                        <li key={index}>
                            <Badge variant={"purple"}>
                                <FileText className="h-4 w-4 min-h-4 min-w-4"/>
                                {milestone.milestone?.title || undefined}
                            </Badge>
                        </li>
                    ))}
                </ul>
            ),
            enableSorting: false,
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Linked projects",
                variant: "multiSelect",
                icon: CircleDashed,
                showInAdvancedOnly: true,
                dbAccessor: (filter: ExtendedColumnFilter<unknown>) => {
                    const filters = [
                        {
                            ...filter,
                            ...(Array.isArray(filter.value) 
                                    ? {value: filter.value.map(projectOption => ({milestone: {id: projectOption}}))} 
                                    : undefined)
                        } as any
                    ]
                    const results = filterColumns({
                        filters,
                        // join operator doesn't matter in this case because there will only be one entry in the list
                        joinOperator: 'or'
                    })

                    return results
                },
                onAsyncSearch: (query) => handleAsyncMilestoneSearch(session?.user?.organizationId, query)
            }
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
            meta: { label: "Notes" },
            enableHiding: true,
        },
        {
            id: "notes",
            accessorKey: "notes",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Internal notes"
                />
            ),
            cell: ({row}) => (
                <div className="line-clamp-3">
                    {row.original.notes}
                </div>
            ),
            meta: { label: "Internal notes" },
            enableHiding: true,
        },
        // {
        //     id: "actions",
        //     cell: ({row}) => <AssetActionsMenu tool={row.original} type={'biosample'}/>,
        //     enableHiding: false,
        // },
    ]

    return columns
}
