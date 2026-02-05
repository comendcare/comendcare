import type {ColumnDef} from "@tanstack/react-table";
import {
    CircleDashed,
    FileText,
    Globe,
    Lock,
} from "lucide-react";
import * as React from "react";
import {
    DataTableColumnHeader
} from "./../data-table/data-table-column-header";
import {
    DISEASE_MODEL_TYPE_OPTIONS,
} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import { Checkbox } from "./../../../ui/checkbox";
import { handleAsyncCompanyAndInstitutionSearch, handleAsyncGeneSearch, handleAsyncMilestoneSearch } from "./../../../../../packages/lib/utils";
import Link from "next/link";
import { Badge } from "./../../../ui/badge";
import { Session } from "next-auth";
import { ExtendedColumnFilter } from "@comend/lib/types/data-table";
import { filterColumns } from "@comend/lib/filter-columns";
import { generateId } from "@comend/lib/id";
import { SeeMoreDescription } from "./../../../../../packages/components/see-more-description";

export function useDiseaseModelsTableColumns({session}: {session: Session | null}): ColumnDef<any>[] {
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
            id: "id",
            accessorKey: "id",
            header: ({column}) => (
                <DataTableColumnHeader
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Model ID"
                    tooltip="Unique ID assigned to this model. This ID is public and appears in the marketplace."
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.id || '--'}</p>
                </div>
            ),
            enableHiding: true,
            meta: { label: "Model ID" }
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
            cell: ({row}) => {
                const options = DISEASE_MODEL_TYPE_OPTIONS.filter(option => row.original.types?.includes(option.value))
                return (
                    (options && options.length > 0)
                        ? (options.map((option, index) => <MilestoneTypeBadge label={option?.label} key={index}/>))
                        : (<p>{'--'}</p>)
                )
            },
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
            id: "strain",
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
            enableHiding: true,
            meta: { label: "Strain" }
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
            cell: ({row}) => (
                <p>{row.original.genotype || '--'}</p>
            ),
            enableHiding: true,
            meta: { label: "Genotype" }
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
            enableHiding: true,
            meta: { label: "Links" }
        },
        {
            id: "milestones",
            accessorKey: "milestones",
            header: ({column}) => (
                <DataTableColumnHeader
                    className="min-w-fit text-nowrap" 
                    column={column} 
                    title="Linked projects"
                />
            ),
            cell: ({row}) => {
                const milestones = row.original.milestones
                return (
                    (milestones && milestones.length > 0)
                        ? (
                            <ul className="flex flex-col gap-2">
                                {milestones.map((milestone: any, index: number) => (
                                    <li key={index}>
                                        <Badge variant={"purple"} className="">
                                            <FileText className="h-4 w-4 min-h-4 min-w-4"/>
                                            {milestone.milestone?.title || undefined}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )
                        : (<p>{'--'}</p>)
                )
            },
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
            cell: ({row}) => {
                const description = row.original.description
                return (
                    (description && description.length > 0)
                        ? (<div className="w-fit min-w-[500px]"><SeeMoreDescription description={description}/></div>)
                        : (<p>{'--'}</p>)
                )
            },
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
            cell: ({row}) => {
                const internalNotes = row.original.notes
                return (
                    (internalNotes && internalNotes.length > 0)
                        ? (<div className="w-fit min-w-[500px]"><SeeMoreDescription description={internalNotes}/></div>)
                        : (<p>{'--'}</p>)
                )
            },
            meta: { label: "Internal notes" },
            enableHiding: true,
        },
        // {
        //     id: "actions",
        //     cell: ({row}) => <AssetActionsMenu tool={row.original} type={'diseaseModel'}/>,
        //     enableHiding: false,
        // },
    ]

    return columns
}
