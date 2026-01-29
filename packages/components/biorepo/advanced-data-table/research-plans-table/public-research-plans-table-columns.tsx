import type {ColumnDef} from "@tanstack/react-table";
import * as React from "react";
import {DataTableColumnHeader} from "./../data-table/data-table-column-header";
import {
    DIAGNOSIS_SEVERITY_OPTIONS,
    Milestone,
    QUANTITY_OPTIONS,
    RESEARCH_PLAN_STATUS,
    RESEARCH_PLAN_TYPES,
    RESEARCH_STAGE
} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import {ProfilePhoto} from "./../../../profile-photo";
import Link from "next/link";
import {Badge} from "./../../../ui/badge";
import {CircleDashed, Globe} from "lucide-react";
import {
    handleAsyncCompanyAndInstitutionSearch,
    handleAsyncConditionSearch,
    handleAsyncDiagnosesSearch,
    handleAsyncGeneSearch,
    handleAsyncInstitutionSearch,
    handleAsyncOrganizationSearch
} from "@comend/lib/utils";
import {ExtendedColumnFilter, ExtendedColumnSort} from "@comend/lib/types/data-table";
import {filterColumns} from "@comend/lib/filter-columns";
import {generateId} from "@comend/lib/id";
import {PropertyBadge} from "./../../../../../packages/components/property-badge";
import ClaimedBadge from "comend-pag-platform/components/claimed-badge";
import { TooltipProvider } from "@comend/components/ui/tooltip"

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
                    <TooltipProvider>

                        <ClaimedBadge
                            organizationId={row.original?.organization?.id}
                            mini={true}
                        />
                    </TooltipProvider>
                </div>
            ),
            enableSorting,
            enableHiding,
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
            cell: ({row}) => (
                <>
                    {RESEARCH_PLAN_TYPES
                        .filter(option => (row.original.modalities || []).includes(option.value))
                        .map(option => <Badge>{option?.label}</Badge>)}
                </>
            ),
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
            cell: ({row}) => (
                <>
                    {RESEARCH_STAGE
                        .filter(option => (row.original.stages || []).includes(option.value))
                        .map(option => <Badge>{option?.label}</Badge>)}
                </>
            ),
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
            cell: ({row}) => (
                <>
                    {RESEARCH_PLAN_STATUS
                        .filter(option => (row.original.statuses || []).includes(option.value))
                        .map(option => <Badge>{option?.label}</Badge>)}
                </>
            ),
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
                const numPublishedProjects = row.original.milestones.filter((milestone: Milestone) => !milestone.private).length

                return (
                    <div className="flex flex-col gap-2 justify-center text-nowrap">
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
            enableSorting,
            enableHiding,
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
