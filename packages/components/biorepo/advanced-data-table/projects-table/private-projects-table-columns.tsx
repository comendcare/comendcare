import type {ColumnDef} from "@tanstack/react-table";
import {CircleDashed, DollarSign, Globe, Lock} from "lucide-react";
import * as React from "react";
import {DataTableColumnHeader} from "../data-table/data-table-column-header";
import {MILESTONE_STATUS_OPTIONS, MILESTONE_TYPE_OPTIONS, StatusType} from "@comend/lib/types";
import { Badge } from "../../../ui/badge";
import { Session } from "next-auth";
import { SeeMoreDescription } from "../../../see-more-description";
import StatusButton from "../../../milestone-status-button";
import { ExtendedColumnFilter } from "@comend/lib/types/data-table";
import { generateId } from "@comend/lib/id";
import { filterColumns } from "@comend/lib/filter-columns";
import { formatMoney, handleAsyncCompanyAndInstitutionSearch } from "@comend/lib/utils";

export function useProjectsTableColumns({session}: {session: Session | null}): ColumnDef<any>[] {
    const columns: ColumnDef<any>[] = [
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
            id: "title",
            accessorKey: "title",
            header: ({column}) => (
                <DataTableColumnHeader 
                    column={column} 
                    title="Project title"
                    className="min-w-fit text-nowrap"
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.title || 'Untitled research plan'}</p>
                </div>
            ),
            enableSorting: true,
            enableHiding: true,
        },
        {
            id: "roadmap.title",
            accessorKey: "roadmap.title",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Research plan title"
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.roadmap?.title || 'Untitled research plan'}</p>
                </div>
            ),
            enableSorting: true,
            enableHiding: true,
        },
        {
            id: "types",
            accessorKey: "types",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Project type"
                />
            ),
            cell: ({row}) => {
                const options = MILESTONE_TYPE_OPTIONS.filter(option => row.original.types?.map((type: any) => type.milestoneTypeId).includes(option.value))
                return (
                    (options && options.length > 0)
                        ? (
                            <div className="flex flex-col gap-2">
                                {options.map(option => <Badge variant={'lightBlue'} className="w-fit">{option?.label}</Badge>)}
                            </div>
                        )
                        : (<p>{'--'}</p>)
                )
            },
            enableHiding: true,
            enableColumnFilter: true,
            // meta: {
            //     label: "Project type",
            //     variant: "multiSelect",
            //     options: MILESTONE_TYPE_OPTIONS,
            //     icon: CircleDashed,
            // },
        },
        {
            id: "description",
            accessorKey: "description",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Description"
                />
            ),
            cell: ({row}) => {
                const description = row.original.description
                return (
                    (description && description.length > 0)
                        ? (<div className="w-fit min-w-[500px]"><SeeMoreDescription description={row.original.description}/></div>)
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting: true,
            enableHiding: true,
        },
        {
            id: "status",
            accessorKey: "status",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Status"
                />
            ),
            cell: ({row}) => (
                <StatusButton
                    disabled={true}
                    minimal={true}
                    className="h-[16px]"
                    status={row.original.status as StatusType || undefined}
                    onStatusChange={() => {}}
                />
            ),
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Status",
                variant: "multiSelect",
                options: MILESTONE_STATUS_OPTIONS,
                icon: CircleDashed,
            },
        },
        {
            id: 'institution.name',
            accessorKey: "institution.name",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Partners"
                />
            ),
            cell: ({row}) => {
                const institutions = (row.original.institutions || []).map((institution: any) => institution.institution.name)
                const companies = (row.original.companies || []).map((company: any) => company.company.title)
                console.log(`institutions`, row.original.institutions)
                console.log(`companies`, row.original.companies)
                return (
                    (institutions.length > 0 || companies.length > 0)
                        ? (
                            <span className={"flex flex-col gap-2"}>
                                {institutions.concat(companies).map((partner: string) => <Badge className="w-fit">{partner}</Badge>)}
                            </span>
                        )
                        : (<p>{'--'}</p>)
                )
            },
            enableHiding: true,
            enableSorting: true,
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
            id: "budget",
            accessorKey: "budget",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Budget"
                />
            ),
            cell: ({row}) => {
                return (
                    (typeof row.original.budget === 'number')
                        ? (
                            <span className="flex gap-1 items-center">
                                <DollarSign className="h-4 w-4"/>
                                <p>{formatMoney(row.original.budget)}</p>
                            </span>
                        )
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting: true,
            enableHiding: true,
        },
        {
            id: "updateAt",
            accessorKey: "updatedAt",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Last edited"
                />
            ),
            cell: ({row}) => {
                return (
                    (row.original.updatedAt)
                        ? (<p>{row.original.updatedAt?.toDateString()}</p>)
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting: true,
            enableHiding: true
        },
    ]

    return columns
}
