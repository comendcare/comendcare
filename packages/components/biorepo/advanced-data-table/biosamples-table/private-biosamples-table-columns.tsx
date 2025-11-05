"use client";

import type {ColumnDef} from "@tanstack/react-table";
import {
    CircleDashed,
    FileText,
    Globe,
    Info,
    Lock,
} from "lucide-react";
import * as React from "react";
import {
    DataTableColumnHeader
} from "./../data-table/data-table-column-header";
import {
    AVAILABILITY_OPTIONS,
    BIOSAMPLE_TYPE_OPTIONS,
    DIAGNOSIS_SEVERITY_OPTIONS,
    DONOR_RACE_OPTIONS,
    DONOR_SEX_OPTIONS,
    Milestone,
} from "./../../../../../packages/lib/types";
import {MilestoneTypeBadge} from "./../../../milestone-type-badge";
import {AssetActionsMenu} from "comend-pag-platform/components/tool-actions-menu";
import { Badge } from "./../../../ui/badge";
import { Checkbox } from "./../../../ui/checkbox";
import { getDiagnosisTypes } from "./../../../../../packages/lib/fetchers";
import { useEffect, useState } from "react";
import { Option } from "./../../../../../packages/lib/types";
import { handleAsyncGeneSearch, handleAsyncInstitutionSearch, handleAsyncMilestoneSearch, handleGetAvailability } from "./../../../../../packages/lib/utils";
import { useSession } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./../../../ui/tooltip";
import Link from "next/link";

export function useBiosamplesTableColumns(): ColumnDef<any>[] {
    const {data: session} = useSession()
    const [diagnosesOptions, setDiagnosesOptions] = useState<Option[]>([])

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
            id: "donorId",
            accessorKey: "donorId",
            header: ({column}) => (
                <DataTableColumnHeader 
                    column={column} 
                    className="min-w-fit text-nowrap"
                    title="Public donor ID"
                    tooltip="This is a unique, public de-identified ID. It will appear in the marketplace.."
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <img className="size-8 rounded-full" src={`https://api.dicebear.com/8.x/shapes/svg?seed=${row.original.donorId}`} alt="User Avatar" />
                    <p>{row.original.donorId}</p>
                </div>
            ),
            enableHiding: true,
            meta: { label: "Public donor ID" }
        },
        {
            id: "donor.internalId",
            accessorKey: "donor.internalId",
            header: ({ column }) => (
                <DataTableColumnHeader 
                    column={column} 
                    className="min-w-fit text-nowrap"
                    title="Internal donor ID" 
                    tooltip="Optional internal ID for your organization’s tracking system. Not guaranteed to be unique or visible outside your organization."
                />
            ),
            enableHiding: true,
            meta: { label: "Internal donor ID" }
        },
        {
            id: "id",
            accessorKey: "id",
            header: ({column}) => (
                <DataTableColumnHeader 
                    column={column} 
                    title="Sample ID"
                    className="min-w-fit text-nowrap"
                    tooltip="Unique ID assigned to this sample. This ID is public and appears in the marketplace."
                />
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{row.original.id || 'No Sample ID'}</p>
                </div>
            ),
            enableHiding: true,
            meta: { 
                label: "Sample ID",
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
                        const typeOption = BIOSAMPLE_TYPE_OPTIONS.find(t => t.value === type)
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
                options: BIOSAMPLE_TYPE_OPTIONS,
                icon: CircleDashed,
            },
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
        //     id: "variant",
        //     accessorKey: "variant",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Variant"/>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Variant",
        //     }
        // },
        {
            id: "donor.sex",
            accessorKey: "donor.sex",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Sex"
                />
            ),
            cell: ({row}) => (
                <>
                    {DONOR_SEX_OPTIONS.find(t => t.value === row.original.donor?.sex)?.label && (
                        <Badge>
                            {DONOR_SEX_OPTIONS.find(t => t.value === row.original.donor?.sex)?.label}
                        </Badge>
                    )}
                </>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Sex",
                variant: "select",
                options: DONOR_SEX_OPTIONS,
                icon: CircleDashed,
                showInAdvancedOnly: true,
            }
        },
        {
            id: "donor.race",
            accessorKey: "donor.race",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Race"
                />
            ),
            cell: ({row}) => (
                <>
                    {DONOR_RACE_OPTIONS.find(t => t.value === row.original.donor?.race)?.label && (
                        <Badge>
                            {DONOR_RACE_OPTIONS.find(t => t.value === row.original.donor?.race)?.label}
                        </Badge>
                    )}
                </>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Race",
                variant: "select",
                options: DONOR_RACE_OPTIONS,
                icon: CircleDashed,
                showInAdvancedOnly: true
            }
        },
        // {
        //     id: "donor.age",
        //     accessorKey: "donor.age",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Age at Collection"/>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Age at Collection",
        //         variant: "range",
        //         range: [0, 150],
        //         showInAdvancedOnly: true,
        //     }
        // },
        {
            id: "donor.diagnoses",
            accessorKey: "donor.diagnoses",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Diagnoses"
                />
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.donor?.diagnoses?.map((diagnosis: any, index: number) => {
                        const severityOption = DIAGNOSIS_SEVERITY_OPTIONS.find(option => option.value === diagnosis.severity)
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <Badge>
                                    {diagnosis?.type?.label} 
                                </Badge>
                                {severityOption && <Badge>{severityOption.label}</Badge>}
                            </li>
                        )
                    })}
                </ul>
            ),
            enableSorting: false,
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Diagnoses",
                variant: "multiSelect",
                options: diagnosesOptions,
                showInAdvancedOnly: true,
                icon: CircleDashed,
            }
        },
        // {
        //     id: "availability",
        //     accessorKey: "availability",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Availability Status"/>
        //     ),
        //     cell: ({row}) => {
        //         const availability = handleGetAvailability(row.original)
        //         if (availability !== undefined) {
        //             return <Badge variant={availability.variant}>{availability.value}</Badge>
        //         }
        //         return <></>
        //     },
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Availability Status",
        //         variant: "select",
        //         options: AVAILABILITY_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true
        //     }
        // },
        {
            // NOTE: in order for filters to access the proper nested database object the path to
            // the nested object must be defined in BOTH the id & accessorKey
            id: "quantity",
            accessorKey: "quantity",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="min-w-fit text-nowrap"
                    column={column} 
                    title="Total available quantity"
                />
            ),
            cell: ({row}) => (
                <>
                    {
                        (
                            row.original.quantity !== null && 
                            row.original.quantity !== undefined && 
                            row.original.quantityUnit && 
                            row.original.quantity >= 0 
                        )
                            ? `${row.original.quantity}${row.original.quantityUnit}`
                            : ``
                    }
                </>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Total available quantity",
                variant: "range",
                range: [0, 1000],
                unit: 'ml',
            },
        },
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
            meta: { label: "Point of contact" }
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
            meta: { label: "Links" }
        },

        // {
        //     // NOTE: in order for filters to access the proper nested database object the path to
        //     // the nested object must be defined in BOTH the id & accessorKey (e.g. biosample.currentCountry)
        //     id: "currentCountry",
        //     accessorKey: "currentCountry",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Current Location"/>
        //     ),
        //     cell: ({row}) => (
        //         <>
        //             {COUNTRY_OPTIONS.find(t => t.value === row.original.currentCountry)?.label}
        //         </>
        //     ),
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Current Location",
        //         variant: "select",
        //         options: COUNTRY_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true
        //     },
        // },
        // {
        //     // NOTE: in order for filters to access the proper nested database object the path to
        //     // the nested object must be defined in BOTH the id & accessorKey (e.g. biosample.countryOfCollection)
        //     id: "countryOfCollection",
        //     accessorKey: "countryOfCollection",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Location of Collection"/>
        //     ),
        //     cell: ({row}) => (
        //         <>
        //             {COUNTRY_OPTIONS.find(t => t.value === row.original.countryOfCollection)?.label}
        //         </>
        //     ),
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Location of Collection",
        //         variant: "select",
        //         options: COUNTRY_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true,
        //     },
        // },
        // {
        //     id: "preservationMethod",
        //     accessorKey: "preservationMethod",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Preservation Method"/>
        //     ),
        //     cell: ({row}) => (
        //         <>
        //             {SAMPLE_PRESERVATION_METHOD_OPTIONS.find(t => t.value === row.original.preservationMethod)?.label}
        //         </>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Preservation Method",
        //         variant: "select",
        //         options: SAMPLE_PRESERVATION_METHOD_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true
        //     },
        // },
        // {
        //     id: "anatomicalSite",
        //     accessorKey: "anatomicalSite",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Anatomical Site"/>
        //     ),
        //     cell: ({row}) => (
        //         <>
        //             {ANATOMICAL_SITE_OPTIONS.find(t => t.value === row.original.anatomicalSite)?.label}
        //         </>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Anatomical Site",
        //         variant: "select",
        //         options: ANATOMICAL_SITE_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true,
        //     }
        // },
        // {
        //     id: "methodOfTransport",
        //     accessorKey: "methodOfTransport",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Method of Transport"/>
        //     ),
        //     cell: ({row}) => (
        //         <>
        //             {SAMPLE_TRANSPORT_METHOD_OPTIONS.find(t => t.value === row.original.methodOfTransport)?.label}
        //         </>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Method of Transport",
        //         variant: "select",
        //         options: SAMPLE_TRANSPORT_METHOD_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true,
        //     }
        // },
        // {
        //     id: "collectionDate",
        //     accessorKey: "collectionDate",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Collection Date"/>
        //     ),
        //     cell: ({row}) => {
        //         return <>{row.original.collectionDate && format(row.original.collectionDate, "MMMM dd, yyyy")}</>
        //     },
        //     enableHiding: true,
        //     // enableColumnFilter: true,
        //     meta: {
        //         label: "Collection Date",
        //         // variant: "dateRange",
        //         // icon: CircleDashed,
        //         // showInAdvancedOnly: true,
        //     }
        // },
        // {
        //     id: "donor.gender",
        //     accessorKey: "donor.gender",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Gender"/>
        //     ),
        //     cell: ({row}) => (
        //         <>
        //             {DONOR_GENDER_OPTIONS.find(t => t.value === row.original.donor?.gender)?.label}
        //         </>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Gender",
        //         variant: "select",
        //         options: DONOR_GENDER_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true
        //     }
        // },
        // {
        //     id: "donor.ethnicity",
        //     accessorKey: "donor.ethnicity",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Ethnicity"/>
        //     ),
        //     cell: ({row}) => (
        //         <>
        //             {DONOR_ETHNICITY_OPTIONS.find(t => t.value === row.original.donor?.ethnicity)?.label}
        //         </>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Ethnicity",
        //         variant: "select",
        //         options: DONOR_ETHNICITY_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true,
        //     }
        // },
        // {
        //     id: "donor.height",
        //     accessorKey: "donor.height",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Height"/>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Height",
        //         variant: "range",
        //         range: [0, 500],
        //         showInAdvancedOnly: true,
        //     }
        // },
        // {
        //     id: "donor.weight",
        //     accessorKey: "donor.weight",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Weight"/>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Weight",
        //         variant: "range",
        //         range: [0, 500],
        //         showInAdvancedOnly: true,
        //     }
        // },
        // {
        //     id: "bmi",
        //     accessorKey: "donor.bmi",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="BMI"/>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "BMI",
        //         variant: "range",
        //         range: [0, 500],
        //         showInAdvancedOnly: true,
        //     }
        // },
        // {
        //     id: "donor.medications",
        //     accessorKey: "donor.medications",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Medications"/>
        //     ),
        //     cell: ({row}) => (
        //         <ul className="flex flex-col gap-2">
        //             {row.original.donor?.medications?.map((medication: string, index: number) => (
        //                 <li key={index} className="line-clamp-2">
        //                     {medication}
        //                 </li>
        //             ))}
        //         </ul>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Medications",
        //     }
        // },
        // {
        //     id: "donor.treatments",
        //     accessorKey: "donor.treatments",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Medical Treatments"/>
        //     ),
        //     cell: ({row}) => (
        //         <ul className="flex flex-col gap-2">
        //             {row.original.donor?.treatments?.map((treatment: string, index: number) => (
        //                 <li key={index} className="line-clamp-2">
        //                     {treatment}
        //                 </li>
        //             ))}
        //         </ul>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Medical Treatments"
        //     }
        // },
        {
            id: "milestones",
            accessorKey: "milestones",
            header: ({column}) => (
                <DataTableColumnHeader 
                    className="text-nowrap"
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
            meta: { label: "Notes" },
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
        //     cell: ({row}) => <AssetActionsMenu tool={row.original} type={'biosample'}/>,
        //     enableHiding: false,
        // },
    ]

    return columns
}
