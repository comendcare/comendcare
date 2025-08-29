"use client";

import type {ColumnDef} from "@tanstack/react-table";
import {
    CircleDashed,
    Globe,
    Lock,
} from "lucide-react";
import * as React from "react";
import {
    DataTableColumnHeader
} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-column-header";
import {
    AVAILABILITY_OPTIONS,
    BIOSAMPLE_TYPE_OPTIONS,
    DIAGNOSIS_SEVERITY_OPTIONS,
    DONOR_RACE_OPTIONS,
    DONOR_SEX_OPTIONS,
    Milestone,
} from "@comend/lib/types";
import {MilestoneTypeBadge} from "@comend/components/milestone-type-badge";
import {AssetActionsMenu} from "comend-pag-platform/components/tool-actions-menu";
import {useSession} from "next-auth/react";
import {usePathname} from "next/navigation";
import { Badge } from "@comend/components/ui/badge";
import { getDiagnosisTypes, getMilestones } from "@comend/lib/fetchers";
import { useEffect, useState } from "react";
import { Option } from "@comend/lib/types";

export function useBiosamplesTableColumns(): ColumnDef<any>[] {
    const {data: session} = useSession()
    const pathname = usePathname()
    const [diagnosesOptions, setDiagnosesOptions] = useState<Option[]>([])

    const handleAsyncGeneSearch = async (query?: string | undefined): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input

        console.log(`HANDLE GENE SEARCH`, query)

        try {
            const response = await fetch(`/api/genes?search=${query}`);
            const data = await response.json();

            // Return the fetched options
            return data;
        } catch (error) {
            console.error("Failed to fetch genes:", error);
            return [];
        }
    };

    const handleAsyncInstitutionSearch = async (query?: string | undefined): Promise<Option[]> => {
        if (!query) return []; // Return empty if no input

        console.log(`HANDLE INSTITUTIONS SEARCH`, query)

        try {
            const response = await fetch(`/api/institutions?search=${query}`);
            const data = await response.json();

            // Return the fetched options
            return data.map((institution: Option) => ({label: institution.label, value: institution.label}));
        } catch (error) {
            console.error("Failed to fetch institutions:", error);
            return [];
        }
    };

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

    const handleGetAvailability = (sample: any): {value: string, variant: 'green' | 'yellow' | 'red'} | undefined => {
        if (sample?.quantity !== null) {
            if (sample.quantity > 0) {
                if (sample?.materialAndDataAccessRequests?.length > 0) {
                    return {value: 'Reserved', variant: 'yellow'}
                }
                return {value: 'Available', variant: 'green'}
            }
            if (sample.quantity <= 0) return {value: 'Depleted', variant: 'red'}
        }

        return undefined
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
            id: "donor.internalId",
            accessorKey: "donor.internalId",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Private Donor ID"/>
            ),
            enableHiding: true,
            meta: {
                label: "Private Donor ID"
            }
        },
        {
            id: "donorId",
            accessorKey: "donorId",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Public Donor ID"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 min-w-[200px] items-center">
                    <img className="h-12 w-12 rounded-full" src={`https://api.dicebear.com/8.x/shapes/svg?seed=${row.original.donorId}`} alt="User Avatar" />
                    <p>{row.original.donorId}</p>
                </div>
            ),
            enableHiding: true,
            meta: {
                label: "Public Donor ID"
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
            id: "gene",
            accessorKey: "gene",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Gene"/>
            ),
            cell: ({row}) => (
                <>{row.original.gene?.symbol}</>
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
        {
            id: "donor.sex",
            accessorKey: "donor.sex",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Sex"/>
            ),
            cell: ({row}) => (
                <>
                    {DONOR_SEX_OPTIONS.find(t => t.value === row.original.donor?.sex)?.label}
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
                <DataTableColumnHeader column={column} title="Race"/>
            ),
            cell: ({row}) => (
                <>
                    {DONOR_RACE_OPTIONS.find(t => t.value === row.original.donor?.race)?.label}
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
                <DataTableColumnHeader column={column} title="Diagnoses"/>
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.donor?.diagnoses?.map((diagnosis: any, index: number) => {
                        const severityOption = DIAGNOSIS_SEVERITY_OPTIONS.find(option => option.value === diagnosis.severity)
                        return (
                            <li key={index} className="grid grid-cols-[minmax(100px,_1fr)_150px] gap-4 items-center">
                                {diagnosis?.type?.label} 
                                {severityOption && <Badge className="w-fit" variant={severityOption.badgeVariant}>{severityOption.label}</Badge>}
                            </li>
                        )
                    })}
                </ul>
            ),
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
        {
            id: "availability",
            accessorKey: "availability",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Availability"/>
            ),
            cell: ({row}) => {
                const availability = handleGetAvailability(row.original)
                if (availability !== undefined) {
                    return <Badge variant={availability.variant}>{availability.value}</Badge>
                }
                return <></>
            },
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Availability",
                variant: "select",
                options: AVAILABILITY_OPTIONS,
                icon: CircleDashed,
                showInAdvancedOnly: true
            }
        },
        {
            // NOTE: in order for filters to access the proper nested database object the path to
            // the nested object must be defined in BOTH the id & accessorKey
            id: "quantity",
            accessorKey: "quantity",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Available Quantity"/>
            ),
            cell: ({row}) => (
                <>
                    {
                        (row.original.quantity && row.original.quantityUnit && row.original.quantity >= 0 )
                            ? `${row.original.quantity}${row.original.quantityUnit}`
                            : `unknown`
                    }
                </>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Available Quantity",
                variant: "range",
                range: [0, 1000],
                unit: 'ml',
            },
        },
        {
            id: "institution",
            accessorKey: "institution",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Storage Facility"/>
            ),
            cell: ({row}) => {
                return <>{row.original.institution?.name}</>
            },
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Storage Facility",
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
            id: "description",
            accessorKey: "description",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Other Notes"/>
            ),
            cell: ({row}) => (
                <div className="line-clamp-3">
                    {row.original.description}
                </div>
            ),
            meta: {
                label: "Other Notes"
            },
            enableHiding: true,
        },
        {
            id: "actions",
            cell: ({row}) => <AssetActionsMenu tool={row.original} type={'biosample'}/>,
            enableHiding: false,
        },
    ]

    return columns
}
