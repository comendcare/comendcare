"use client";

import type {ColumnDef} from "@tanstack/react-table";
import {
    CircleDashed,
    Globe,
    Lock,
    Pin,
} from "lucide-react";
import * as React from "react";
import {
    DataTableColumnHeader
} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-column-header";
import {
    ANATOMICAL_SITE_OPTIONS,
    AVAILABILITY_OPTIONS,
    BIOSAMPLE_TYPE_OPTIONS,
    COUNTRY_OPTIONS,
    DIAGNOSIS_SEVERITY_OPTIONS,
    DISEASE_MODEL_TYPE_OPTIONS,
    DONOR_ETHNICITY_OPTIONS,
    DONOR_GENDER_OPTIONS,
    DONOR_RACE_OPTIONS,
    DONOR_SEX_OPTIONS,
    Milestone,
    SAMPLE_PRESERVATION_METHOD_OPTIONS,
    SAMPLE_TRANSPORT_METHOD_OPTIONS,
} from "@comend/lib/types";
import {MilestoneTypeBadge} from "@comend/components/milestone-type-badge";
import {AssetActionsMenu} from "comend-pag-platform/components/tool-actions-menu";
import {revalidate} from "@comend/lib/revalidate";
import {Button} from "@comend/components/ui/button";
import {updateBiosample} from "@comend/lib/actions";
import {useSession} from "next-auth/react";
import {usePathname} from "next/navigation";
import { Badge } from "@comend/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { getDiagnosisTypes, getMilestones } from "@comend/lib/fetchers";
import { useEffect, useState } from "react";
import { Option } from "@comend/lib/types";

// columns temporarily hidden on production
const hiddenColumnIds = [
    'diagnoses',
    'gene',
    'variant',
    'volume',
    'currentCountry',
    'countryOfCollection',
    'institution',
    'pathology',
    'preservationMethod',
    'anatomicalSite',
    'methodOfTransport',
    'collectionDate',
    'donorId',
    'age',
    'sex',
    'gender',
    'race',
    'ethnicity',
    'height',
    'weight',
    'bmi',
    'medications',
    'treatments',
]

export function useDiseaseModelsTableColumns(): ColumnDef<any>[] {
    const {data: session} = useSession()
    const pathname = usePathname()
    const [diagnosesOptions, setDiagnosesOptions] = useState<Option[]>([])

    const handleAsyncMilestoneSearch = async (query?: string | undefined): Promise<Option[]> => {
        if (!query) return []

        try {
            // const response = await fetch(`/api/institutions?search=${query}`);
            // const data = await response.json();
            const response = await getMilestones(session?.user.organizationId)

            if (response.success && response.data) {
                return response.data.map((project: Milestone) => ({label: project.title, value: project.title}))
            } else {
                return []
            }

            // Return the fetched options
            // return data.map((institution: Option) => ({label: institution.label, value: institution.label}));
        } catch (error) {
            console.error("Failed to fetch institutions:", error);
            return [];
        }
    }

    useEffect(() => {
        const init = async () => {
            const response = await getDiagnosisTypes()
            if (response.success && response.data) {
                setDiagnosesOptions(response.data.map((diagnosisType: any) => ({label: diagnosisType.label, value: diagnosisType.id})))
            }
        }

        init()
    }, [])

    const columns: ColumnDef<any>[] = [
        {
            id: "private",
            accessorKey: "private",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Visibility"/>
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
            },
        },
        {
            id: "id",
            accessorKey: "id",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Sample ID"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.id || 'No Sample ID'}</p>
                </div>
            ),
            enableHiding: true,
            meta: {
                label: "Sample ID"
            }
        },
        {
            id: "types",
            accessorKey: "types",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Type"/>
            ),
            cell: ({row}) => (
                <>
                    {(row.original.types || []).map((type: string, index: number) => {
                        const typeOption = DISEASE_MODEL_TYPE_OPTIONS.find(t => t.value === type)
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
                options: DISEASE_MODEL_TYPE_OPTIONS,
                icon: CircleDashed,
            },
        },
        // {
        //     id: "strain",
        //     accessorKey: "strain",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Strain"/>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Strain"
        //     }
        // },
        {
            id: "gene",
            accessorKey: "gene",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Gene"/>
            ),
            cell: ({row}) => (
                <>{row.original.gene?.symbol}</>
            ),
            enableHiding: true,
            meta: {
                label: "Gene"
            }
        },
        // {
        //     id: "genotype",
        //     accessorKey: "genotype",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Genotype"/>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Genotype",
        //     }
        // },
        // {
        //     id: "phenotype",
        //     accessorKey: "phenotype",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Phenotype"/>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Phenotype",
        //     }
        // },
        // {
        //     id: "patientId",
        //     accessorKey: "patientId",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Linked Patient ID"/>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Linked Patient ID",
        //     }
        // },
        // {
        //     id: "availability",
        //     accessorKey: "availability",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Availability"/>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Availability",
        //     }
        // },
        {
            id: "institution",
            accessorKey: "institution",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Storage Facility"/>
            ),
            cell: ({row}) => {
                // if (row.original.institution?.website && row.original.institution?.name) {
                //     return (
                //         <Link className="underline" href={row.original.institution?.website}>
                //             {row.original.institution?.name}
                //         </Link>
                //     )
                // }
                // if (row.original.institution?.name) return (<>{row.original.institution?.name}</>)
                // return <></>
                return <>{row.original.institution?.name}</>
            },
            enableHiding: true,
            meta: {
                label: "Storage Facility"
            }
        },
        {
            id: "contacts",
            accessorKey: "contacts",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Point of Contact"/>
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
            enableHiding: true,
            meta: {
                label: "Point of Contact"
            }
        },
        {
            id: "links",
            accessorKey: "links",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Links"/>
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.attachments?.map((attachment: any, index: number) => (
                        <li key={index} className="line-clamp-2">
                            {attachment.name || attachment.link}
                        </li>
                    ))}
                </ul>
            ),
            enableHiding: true,
            meta: {
                label: "Links"
            }
        },

        // {
        //     id: "condition",
        //     accessorKey: "condition",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Condition"/>
        //     ),
        //     cell: ({row}) => (
        //         <div className="flex gap-2 items-center">
        //             <p>{(row.original.organization?.conditions || []).map((condition: any) => condition.condition.name) || 'No Condition'}</p>
        //         </div>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Condition"
        //     }
        // },
        // {
        //     id: "description",
        //     accessorKey: "description",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Description"/>
        //     ),
        //     cell: ({row}) => (
        //         <div className="line-clamp-3">
        //             {row.original.description}
        //         </div>
        //     ),
        //     meta: {
        //         label: "Description"
        //     },
        //     enableHiding: true,
        // },
        {
            id: "milestones",
            accessorKey: "milestones",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Linked Projects"/>
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.milestones?.map((milestone: any, index: number) => (
                        <li key={index} className="line-clamp-2">
                            {milestone.milestone?.title || undefined}
                        </li>
                    ))}
                </ul>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Linked Projects",
                variant: "multiSelect",
                icon: CircleDashed,
                showInAdvancedOnly: true,
                onAsyncSearch: handleAsyncMilestoneSearch
            }
        },
        {
            id: "actions",
            cell: ({row}) => <AssetActionsMenu tool={row.original} type={'biosample'}/>,
            enableHiding: false,
        },
        {
            id: "actions",
            cell: ({row}) => <AssetActionsMenu tool={row.original} type={'diseaseModel'}/>,
            enableHiding: false,
        },
    ]

    // Temporarily hide additional biobank columns from users on production
    // This can be removed, and all columns enabled once our biobank feature is built out
    if (process.env.NEXT_PUBLIC_NODE_ENV === "production") {
        return columns.filter(column => column.id && !hiddenColumnIds.includes(column.id))
    }

    return columns
}
