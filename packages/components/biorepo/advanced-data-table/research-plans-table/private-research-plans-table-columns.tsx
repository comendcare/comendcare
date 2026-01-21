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
    DIAGNOSIS_SEVERITY_OPTIONS,
    DONOR_RACE_OPTIONS,
    DONOR_SEX_OPTIONS,
    QUANTITY_OPTIONS,
    RESEARCH_PLAN_TYPES,
} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import { Badge } from "./../../../ui/badge";
import { Checkbox } from "./../../../ui/checkbox";
import { handleAsyncCompanyAndInstitutionSearch, handleAsyncDiagnosesSearch, handleAsyncGeneSearch, handleAsyncMilestoneSearch } from "./../../../../../packages/lib/utils";
import Link from "next/link";
import { filterColumns } from "@comend/lib/filter-columns";
import { generateId } from "@comend/lib/id";
import { ExtendedColumnFilter } from "@comend/lib/types/data-table";
import { Session } from "next-auth";

export function useResearchPlansTableColumns({session}: {session: Session | null}): ColumnDef<any>[] {
    const columns: ColumnDef<any>[] = [
        // {
        //     id: "select",
        //     header: ({ table }) => (
        //         <div className="-ml-1 pr-1">
        //             <Checkbox
        //                 checked={
        //                     table.getIsAllPageRowsSelected() ||
        //                     (table.getIsSomePageRowsSelected() && "indeterminate")
        //                 }
        //                 onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        //                 aria-label="Select all"
        //                 className="translate-y-[2px]"
        //             />
        //         </div>
        //     ),
        //     cell: ({ row }) => (
        //         <div
        //             onClick={(e) => {
        //                 e.stopPropagation(); // prevent row onClick from firing
        //             }}
        //         >
        //             <Checkbox
        //                 checked={row.getIsSelected()}
        //                 onCheckedChange={(value) => row.toggleSelected(!!value)}
        //                 aria-label="Select row"
        //                 className="translate-y-[2px]"
        //             />
        //         </div>
        //     ),
        //     enableSorting: false,
        //     enableHiding: false,
        //     meta: { label: "Select" }
        // },
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
                    title="Title"
                    className="min-w-fit text-nowrap"
                    // tooltip="Unique ID assigned to this sample. This ID is public and appears in the marketplace."
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.title || 'Untitled research plan'}</p>
                </div>
            ),
            enableHiding: true,
            meta: { label: "Title" }
        },
        {
            id: "modalities",
            accessorKey: "modalities",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Therapeutic strategy"
                />
            ),
            cell: ({row}) => (
                <>
                    {(row.original.types || []).map((type: string, index: number) => {
                        const typeOption = RESEARCH_PLAN_TYPES.find(t => t.value === type)
                        return (
                            <Badge>{typeOption?.label}</Badge>
                        )
                    })}
                </>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Type",
                variant: "multiSelect",
                options: RESEARCH_PLAN_TYPES,
                icon: CircleDashed,
            },
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
        // {
        //     id: "actions",
        //     cell: ({row}) => <AssetActionsMenu tool={row.original} type={'research-plan'}/>,
        //     enableHiding: false,
        // },
    ]

    return columns
}
