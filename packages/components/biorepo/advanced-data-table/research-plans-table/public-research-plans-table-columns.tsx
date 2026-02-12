import type {ColumnDef} from "@tanstack/react-table";
import * as React from "react";
import {DataTableColumnHeader} from "./../data-table/data-table-column-header";
import {Milestone, MILESTONE_TYPE_OPTIONS, RESEARCH_PLAN_STATUS, RESEARCH_PLAN_TYPES, RESEARCH_STAGE} from "./../../../../../packages/lib/types";
import { ProfilePhoto } from "./../../../profile-photo";
import Link from "next/link";
import { Badge } from "./../../../ui/badge";
import { Building, ExternalLink, Globe, Link as LinkIcon } from "lucide-react";
import { PropertyBadge } from "./../../../../../packages/components/property-badge";
import ClaimedBadge from "comend-pag-platform/components/claimed-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./../../../ui/tooltip";
import { SeeMoreDescription } from "./../../../../../packages/components/see-more-description";

type Preset = "default" | "profile";

export function useResearchPlansTableColumns(
    enableSorting: boolean = true,
    enableHiding: boolean = true,
    typesenseSearch: boolean = true,
    presetName?: Preset,
): ColumnDef<any>[] {
    const preset = presetName || 'default'

    const columns: ColumnDef<any>[] = [
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
            enableSorting,
            enableHiding,
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
                    <ClaimedBadge
                        organizationId={row.original?.organization?.id}
                        mini={true}
                    />
                </div>
            ),
            enableSorting,
            enableHiding,
        },
        {
            id: "modalities",
            accessorKey: "modalities",
            header: ({column}) => (
                <DataTableColumnHeader
                    className="min-w-fit text-nowrap"
                    column={column}
                    title="Research strategy"
                />
            ),
            cell: ({row}) => {
                const options = RESEARCH_PLAN_TYPES.filter(option => row.original.modalities?.includes(option.value))
                return (
                    (options && options.length > 0)
                        ? (options.map(option => <Badge variant={'lightBlue'}>{option?.label}</Badge>))
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting: false,
            enableHiding,
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
            cell: ({row}) => {
                const options = RESEARCH_STAGE.filter(option => row.original.stages?.includes(option.value))
                return (
                    (options && options.length > 0)
                        ? (options.map(option => <Badge variant={option?.variant || 'secondary'}>{option?.label}</Badge>))
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting: false,
            enableHiding,
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
            cell: ({row}) => {
                const options = RESEARCH_PLAN_STATUS.filter(option => row.original.statuses?.includes(option.value))
                return (
                    (options && options.length > 0)
                        ? (options.map(option => <Badge>{option?.label}</Badge>))
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting: false,
            enableHiding,
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
            cell: ({row}) => {
                const partners = row.original.partners
                return (
                    (partners && partners.length > 0)
                        ? (
                            <ul className="flex flex-col gap-2">
                                {partners.map((partner: any, index: number) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <Building className="h-4 min-h-4 w-4 min-w-4"/>
                                        {partner.affiliation}
                                    </li>
                                ))}
                            </ul>
                        )
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting: false,
            enableHiding,
        },
        {
            id: "description",
            accessorKey: "description",
            header: ({column}) => (
                <DataTableColumnHeader
                    className="min-w-fit text-nowrap min-w-[200px]"
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
            enableSorting,
            enableHiding,
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
                const links = row.original.links
                return (
                    (links && links.length > 0)
                        ? (
                            <ul className="flex flex-col gap-2">
                                {links?.map((attachment: any, index: number) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <LinkIcon className="h-4 min-h-4 w-4 min-w-4"/>
                                        <Link 
                                            className="line-clamp-2 underline" 
                                            href={attachment.link || "/"}
                                            target="_blank"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                        {attachment.name || attachment.link}
                                        </Link>
                                        <ExternalLink className="h-4 min-h-4 w-4 min-w-4"/>
                                    </li>
                                ))}
                            </ul>
                        )
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting: false,
            enableHiding,
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
                // const featuredProjectTypes = ['BIOMARKER', 'EFFICASYSTUDY', 'NATURALHISTORYSTUDY', 'GPMANUFACTURING', 'TOXICOLOGYSTUDY', 'INDSUBMISSION']
                // const milestoneTypes = row.original.milestones?.flatMap((milestone: any) => milestone?.types)?.map((type: any) => type?.milestoneType?.id)?.filter((typeVal: string) => featuredProjectTypes.includes(typeVal))
                const numPublishedProjects = row.original.milestones.filter((milestone: Milestone) => !milestone.private).length
                return (
                    (numPublishedProjects > 0)
                        ? (
                            <div className="flex gap-6">
                            <div className="flex flex-col gap-2 justify-center text-nowrap">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <PropertyBadge 
                                            className="text-nowrap border-green-200 text-green-900 font-semibold" 
                                            icon={Globe}
                                        >
                                            {numPublishedProjects}
                                        </PropertyBadge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{numPublishedProjects === 1 ? `${numPublishedProjects} published project` : `${numPublishedProjects} published projects`}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            {/* <div className="flex flex-col gap-2">
                                {MILESTONE_TYPE_OPTIONS.filter(option => milestoneTypes.includes(option.id)).map(option => <Badge variant="lightBlue">{option.label}</Badge>)}
                            </div> */}
                            </div>
                        )
                        : (<p>{'--'}</p>)
                )
            },
            enableSorting,
            enableHiding,
        },
    ]

    const presets: Record<Preset, string[]> = {
        default: columns.map((c) => c.id as string),
        profile: [
            "title",
            "modalities",
            "stages",
            "statuses",
            "partners",
            "links",
            "milestones",
            "description"
        ],
    };

    const wanted = new Set(presets[preset]);
    return columns.filter((c) => wanted.has(c.id as string));
}
