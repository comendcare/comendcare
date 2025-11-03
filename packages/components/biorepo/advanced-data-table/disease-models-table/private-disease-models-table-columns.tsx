"use client";

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
    Milestone,
} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import {AssetActionsMenu} from "comend-pag-platform/components/tool-actions-menu";
import {useSession} from "next-auth/react";
import { Checkbox } from "./../../../ui/checkbox";
import { handleAsyncGeneSearch, handleAsyncInstitutionSearch, handleAsyncMilestoneSearch } from "./../../../../../packages/lib/utils";
import Link from "next/link";
import { Badge } from "./../../../ui/badge";

export function useDiseaseModelsTableColumns(): ColumnDef<any>[] {
    const {data: session} = useSession()
    // const [diagnosesOptions, setDiagnosesOptions] = useState<Option[]>([])

    // useEffect(() => {
    //     const init = async () => {
    //         const response = await getDiagnosisTypes()
    //         if (response.success && response.data) {
    //             setDiagnosesOptions(response.data.map((diagnosisType: any) => ({label: diagnosisType.label, value: diagnosisType.id})))
    //         }
    //     }

    //     init()
    // }, [])

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
                    <p>{row.original.id || 'No Model ID'}</p>
                </div>
            ),
            enableHiding: true,
            meta: {
                label: "Model ID"
            }
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
            enableHiding: true,
            meta: {
                label: "Strain"
            }
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
            cell: ({row}) => (
                <>
                    {row.original.gene?.symbol && (
                        <Badge variant={"teal"}>
                            {row.original.gene.symbol}
                        </Badge>
                    )}
                </>
            ),
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
            enableHiding: true,
            meta: {
                label: "Genotype"
            }
        },
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
            id: "institution.name",
            accessorKey: "institution.name",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Stored with"
                />
            ),
            cell: ({row}) => {
                return (
                    <>
                    {(row.original.institution?.name || row.original.company?.title) && (
                        <Badge>
                            {row.original.institution?.name || row.original.company?.title}
                        </Badge>
                    )}
                    </>
                )
            },
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Stored with",
                variant: "select",
                icon: CircleDashed,
                showInAdvancedOnly: true,
                onAsyncSearch: handleAsyncInstitutionSearch
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
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.contacts?.map((contact: any, index: number) => (
                        <li key={index}>
                            {contact.name || contact.email || contact.affiliation}
                        </li>
                    ))}
                </ul>
            ),
            enableSorting: false,
            enableHiding: true,
            meta: {
                label: "Point of contact"
            }
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
            ),
            enableSorting: false,
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
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.milestones?.map((milestone: any, index: number) => (
                        <li key={index}>
                            <Badge variant={"purple"}>
                                <FileText className="h-4 w-4 min-h-4 min-w-4"/>
                                {milestone.milestone?.title || undefined}
                            </Badge>
                        </li>
                    ))}
                </ul>
            ),
            enableSorting: false,
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Linked projects",
                variant: "multiSelect",
                icon: CircleDashed,
                showInAdvancedOnly: true,
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
            cell: ({row}) => (
                <div className="line-clamp-3">
                    {row.original.description}
                </div>
            ),
            meta: {
                label: "Notes"
            },
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
            cell: ({row}) => (
                <div className="line-clamp-3">
                    {row.original.notes}
                </div>
            ),
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
