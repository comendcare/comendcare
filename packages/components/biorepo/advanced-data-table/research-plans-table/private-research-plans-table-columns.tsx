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
    RESEARCH_PLAN_STATUS,
    RESEARCH_PLAN_TYPES,
    RESEARCH_STAGE,
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
import { ResearchPlanActionsMenu } from "comend-pag-platform/components/research-plans-actions-menu";
import { PropertyBadge } from "./../../../../../packages/components/property-badge";
import { Milestone } from "@prisma/client";

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
            enableSorting: false,
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
            enableSorting: false,
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
                    {(row.original.modalities || []).map((type: string, index: number) => {
                        const typeOption = RESEARCH_PLAN_TYPES.find(t => t.value === type)
                        return (
                            <Badge>{typeOption?.label}</Badge>
                        )
                    })}
                </>
            ),
            enableSorting: false,
        },
        {
            id: "stages",
            accessorKey: "stages",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Stage"
                />
            ),
            cell: ({row}) => (
                <>
                    {(row.original.stages || []).map((type: string, index: number) => {
                        const typeOption = RESEARCH_STAGE.find(t => t.value === type)
                        return (
                            <Badge>{typeOption?.label}</Badge>
                        )
                    })}
                </>
            ),
            enableSorting: false,
        },
        {
            id: "statuses",
            accessorKey: "statuses",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Status"
                />
            ),
            cell: ({row}) => (
                <>
                    {(row.original.statuses || []).map((type: string, index: number) => {
                        const typeOption = RESEARCH_PLAN_STATUS.find(t => t.value === type)
                        return (
                            <Badge>{typeOption?.label}</Badge>
                        )
                    })}
                </>
            ),
            enableSorting: false,
        },
        {
            id: "partners",
            accessorKey: "partners",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Partners"
                />
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.partners?.map((partner: any, index: number) => (
                        <li key={index}>
                            {partner.affiliation}
                        </li>
                    ))}
                </ul>
            ),
            enableSorting: false,
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
                    {row.original.links?.map((attachment: any, index: number) => (
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
        },
        {
            id: "milestones",
            accessorKey: "milestones",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Number of projects"
                />
            ),
            cell: ({row}) => {
                const numPrivateProjects = row.original.milestones.filter((milestone: Milestone) => milestone.private).length
                const numPublishedProjects = row.original.milestones.filter((milestone: Milestone) => !milestone.private).length

                return (
                    <div className="flex flex-col gap-2 justify-center text-nowrap">
                        {numPrivateProjects > 0 && (
                            <PropertyBadge 
                                className="text-nowrap border-red-200 text-red-900 font-semibold" 
                                icon={Lock}
                            >
                                {numPrivateProjects === 1 ? `${numPrivateProjects} private project` : `${numPrivateProjects} private projects`}
                            </PropertyBadge>
                        )}
                        {numPublishedProjects > 0 && (
                            <PropertyBadge 
                                className="text-nowrap border-green-200 text-green-900 font-semibold" 
                                icon={Globe}
                            >
                                {numPublishedProjects === 1 ? `${numPublishedProjects} published project` : `${numPublishedProjects} published projects`}
                            </PropertyBadge>
                        )}
                    </div>
                )
            },
            enableSorting: false,
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
            cell: ({row}) => (
                <div className="line-clamp-3">
                    {row.original.description}
                </div>
            ),
            enableSorting: false,
        },
        {
            id: "actions",
            size: 1,        // smallest possible width
            minSize: 1,
            maxSize: 1,
            enableResizing: false,
            cell: ({row}) => <ResearchPlanActionsMenu researchPlan={row.original}/>,
            enableHiding: false,
            enableSorting: false,
        },
    ]

    return columns
}
