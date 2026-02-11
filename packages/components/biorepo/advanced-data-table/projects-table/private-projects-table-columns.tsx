import type {ColumnDef} from "@tanstack/react-table";
import {Globe, Lock, Link as LinkIcon, ExternalLink, Building} from "lucide-react";
import * as React from "react";
import {DataTableColumnHeader} from "../data-table/data-table-column-header";
import {
    MILESTONE_TYPE_OPTIONS,
    RESEARCH_PLAN_STATUS,
    RESEARCH_PLAN_TYPES,
    RESEARCH_STAGE,
} from "@comend/lib/types";
import { Badge } from "../../../ui/badge";
import Link from "next/link";
import { Session } from "next-auth";
import { ResearchPlanActionsMenu } from "comend-pag-platform/components/research-plans-actions-menu";
import { PropertyBadge } from "../../../property-badge";
import { Milestone } from "@prisma/client";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import { SeeMoreDescription } from "../../../see-more-description";

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
                console.log(`types`, row.original.types)
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
            enableSorting: false,
        },
    ]

    return columns
}
