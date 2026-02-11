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
        // {
        //     id: "modalities",
        //     accessorKey: "modalities",
        //     header: ({column}) => (
        //         <DataTableColumnHeader 
        //             className="min-w-fit text-nowrap"
        //             column={column} 
        //             title="Research strategy"
        //         />
        //     ),
        //     cell: ({row}) => {
        //         const options = RESEARCH_PLAN_TYPES.filter(option => row.original.modalities?.includes(option.value))
        //         return (
        //             (options && options.length > 0)
        //                 ? (options.map(option => <Badge variant={'lightBlue'}>{option?.label}</Badge>))
        //                 : (<p>{'--'}</p>)
        //         )
        //     },
        //     enableSorting: false,
        // },
        // {
        //     id: "stages",
        //     accessorKey: "stages",
        //     header: ({column}) => (
        //         <DataTableColumnHeader 
        //             className="min-w-fit text-nowrap"
        //             column={column} 
        //             title="Stage"
        //         />
        //     ),
        //     cell: ({row}) => {
        //         const options = RESEARCH_STAGE.filter(option => row.original.stages?.includes(option.value))
        //         return (
        //             (options && options.length > 0)
        //                 ? (options.map(option => <Badge variant={option?.variant || 'secondary'}>{option?.label}</Badge>))
        //                 : (<p>{'--'}</p>)
        //         )
        //     },
        //     enableSorting: false,
        // },
        // {
        //     id: "statuses",
        //     accessorKey: "statuses",
        //     header: ({column}) => (
        //         <DataTableColumnHeader 
        //             className="min-w-fit text-nowrap"
        //             column={column} 
        //             title="Status"
        //         />
        //     ),
        //     cell: ({row}) => {
        //         const options = RESEARCH_PLAN_STATUS.filter(option => row.original.statuses?.includes(option.value))
        //         return (
        //             (options && options.length > 0)
        //                 ? (options.map(option => <Badge>{option?.label}</Badge>))
        //                 : (<p>{'--'}</p>)
        //         )
        //     },
        //     enableSorting: false,
        // },
        // {
        //     id: "partners",
        //     accessorKey: "partners",
        //     header: ({column}) => (
        //         <DataTableColumnHeader 
        //             className="min-w-fit text-nowrap"
        //             column={column} 
        //             title="Partners"
        //         />
        //     ),
        //     cell: ({row}) => {
        //         const partners = row.original.partners
        //         return (
        //             (partners && partners.length > 0)
        //                 ? (
        //                     <ul className="flex flex-col gap-2">
        //                         {partners.map((partner: any, index: number) => (
        //                             <li key={index} className="flex items-center gap-2">
        //                                 <Building className="h-4 min-h-4 w-4 min-w-4"/>
        //                                 {partner.affiliation}
        //                             </li>
        //                         ))}
        //                     </ul>
        //                 )
        //                 : (<p>{'--'}</p>)
        //         )
        //     },
        //     enableSorting: false,
        // },
        // {
        //     id: "description",
        //     accessorKey: "description",
        //     header: ({column}) => (
        //         <DataTableColumnHeader 
        //             className="min-w-fit text-nowrap"
        //             column={column} 
        //             title="Description"
        //         />
        //     ),
        //     cell: ({row}) => {
        //         const description = row.original.description
        //         return (
        //             (description && description.length > 0)
        //                 ? (<div className="w-fit min-w-[500px]"><SeeMoreDescription description={row.original.description}/></div>)
        //                 : (<p>{'--'}</p>)
        //         )
        //     },
        //     enableSorting: false,
        // },
        // {
        //     id: "links",
        //     accessorKey: "links",
        //     header: ({column}) => (
        //         <DataTableColumnHeader 
        //             className="min-w-fit text-nowrap"
        //             column={column} 
        //             title="Links"
        //         />
        //     ),
        //     cell: ({row}) => {
        //         const links = row.original.links
        //         return (
        //             (links && links.length > 0)
        //                 ? (
        //                     <ul className="flex flex-col gap-2">
        //                         {links?.map((attachment: any, index: number) => (
        //                             <li key={index} className="flex items-center gap-2">
        //                                 <LinkIcon className="h-4 min-h-4 w-4 min-w-4"/>
        //                                 <Link 
        //                                     className="line-clamp-2 underline" 
        //                                     href={attachment.link || "/"}
        //                                     target="_blank"
        //                                     onClick={(e) => e.stopPropagation()}
        //                                 >
        //                                 {attachment.name || attachment.link}
        //                                 </Link>
        //                                 <ExternalLink className="h-4 min-h-4 w-4 min-w-4"/>
        //                             </li>
        //                         ))}
        //                     </ul>
        //                 )
        //                 : (<p>{'--'}</p>)
        //         )
        //     },
        //     enableSorting: false,
        // },
        // {
        //     id: "milestones",
        //     accessorKey: "milestones",
        //     header: ({column}) => (
        //         <DataTableColumnHeader 
        //             className="min-w-fit text-nowrap"
        //             column={column} 
        //             title="Number of projects"
        //         />
        //     ),
        //     cell: ({row}) => {
        //         // const featuredProjectTypes = ['BIOMARKER', 'EFFICASYSTUDY', 'NATURALHISTORYSTUDY', 'GPMANUFACTURING', 'TOXICOLOGYSTUDY', 'INDSUBMISSION']
        //         // const milestoneTypes = row.original.milestones?.flatMap((milestone: any) => milestone?.types)?.map((type: any) => type?.milestoneType?.id)?.filter((typeVal: string) => featuredProjectTypes.includes(typeVal))
        //         const numPrivateProjects = row.original.milestones.filter((milestone: Milestone) => milestone.private).length
        //         const numPublishedProjects = row.original.milestones.filter((milestone: Milestone) => !milestone.private).length
        //         return (
        //             (numPrivateProjects > 0 || numPublishedProjects > 0)
        //                 ? (
        //                     <div className="flex gap-6">
        //                     <div className="flex flex-col gap-2 justify-center text-nowrap">
        //                         {numPrivateProjects > 0 && (
        //                             <Tooltip>
        //                                 <TooltipTrigger>
        //                                     <PropertyBadge 
        //                                         className="text-nowrap border-red-200 text-red-900 font-semibold" 
        //                                         icon={Lock}
        //                                     >
        //                                         {numPrivateProjects}
        //                                     </PropertyBadge>
        //                                 </TooltipTrigger>
        //                                 <TooltipContent>
        //                                     <p>{numPrivateProjects === 1 ? `${numPrivateProjects} private project` : `${numPrivateProjects} private projects`}</p>
        //                                 </TooltipContent>
        //                             </Tooltip>
        //                         )}
        //                         {numPublishedProjects > 0 && (
        //                             <Tooltip>
        //                                 <TooltipTrigger>
        //                                     <PropertyBadge 
        //                                         className="text-nowrap border-green-200 text-green-900 font-semibold" 
        //                                         icon={Globe}
        //                                     >
        //                                         {numPublishedProjects}
        //                                     </PropertyBadge>
        //                                 </TooltipTrigger>
        //                                 <TooltipContent>
        //                                     <p>{numPublishedProjects === 1 ? `${numPublishedProjects} published project` : `${numPublishedProjects} published projects`}</p>
        //                                 </TooltipContent>
        //                             </Tooltip>
        //                         )}
        //                     </div>
        //                     {/* <div className="flex flex-col gap-2">
        //                         {MILESTONE_TYPE_OPTIONS.filter(option => milestoneTypes.includes(option.id)).map(option => <Badge variant="lightBlue">{option.label}</Badge>)}
        //                     </div> */}
        //                     </div>
        //                 )
        //                 : (<p>{'--'}</p>)
        //         )
        //     },
        //     enableSorting: false,
        // },
        // {
        //     id: "actions",
        //     size: 1,        // smallest possible width
        //     minSize: 1,
        //     maxSize: 1,
        //     enableResizing: false,
        //     cell: ({row}) => <ResearchPlanActionsMenu researchPlan={row.original}/>,
        //     enableHiding: false,
        //     enableSorting: false,
        // },
    ]

    return columns
}
