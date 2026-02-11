import type {ColumnDef} from "@tanstack/react-table";
import {Globe, Lock} from "lucide-react";
import * as React from "react";
import {DataTableColumnHeader} from "../data-table/data-table-column-header";
import {MILESTONE_TYPE_OPTIONS, StatusType} from "@comend/lib/types";
import { Badge } from "../../../ui/badge";
import { Session } from "next-auth";
import { SeeMoreDescription } from "../../../see-more-description";
import StatusButton from "../../../milestone-status-button";

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
                    title="Project title"
                    className="min-w-fit text-nowrap"
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
            enableSorting: false,
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
            enableSorting: false,
        },
    ]

    return columns
}
