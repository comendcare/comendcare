"use client";

import type {ColumnDef} from "@tanstack/react-table";
import {
    CircleDashed,
    Globe,
    Lock,
    Pin,
    Text,
} from "lucide-react";
import * as React from "react";
import {
    EditableCell
} from "@comend/components/biorepo/advanced-data-table/data-table/editable-cell";
import {
    DataTableColumnHeader
} from "@comend/components/biorepo/advanced-data-table/data-table/data-table-column-header";
import {
    BIOSAMPLE_TYPE_OPTIONS,
    COUNTRY_OPTIONS,
    DONOR_ETHNICITY_OPTIONS,
    DONOR_GENDER_OPTIONS,
    DONOR_RACE_OPTIONS,
    DONOR_SEX_OPTIONS,
    ANATOMICAL_SITE_OPTIONS,
    SAMPLE_PRESERVATION_METHOD_OPTIONS,
    SAMPLE_TRANSPORT_METHOD_OPTIONS,
    TOOL_TYPE_OPTIONS
} from "@comend/lib/types";
import {MilestoneTypeBadge} from "@comend/components/milestone-type-badge";
import {revalidate} from "@comend/lib/revalidate";
import {Button} from "@comend/components/ui/button";
import {useSession} from "next-auth/react";
import {usePathname} from "next/navigation";
import {Checkbox} from "@comend/components/ui/checkbox";
import { createOrUpdateBiosample } from "@comend/lib/actions";
import {Avatar, AvatarFallback, AvatarImage} from "@comend/components/ui/avatar";
import { nameToInitials } from "@comend/lib/utils";
import { ProfilePhoto } from "@comend/components/profile-photo";
import { Badge } from "@comend/components/ui/badge";

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

export function useBiosamplesTableColumns(): ColumnDef<any>[] {

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

    const columns: ColumnDef<any>[] = [
        {
            id: "organization",
            accessorKey: "organization",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Organization"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center w-[150px]">
                    <ProfilePhoto
                        img={row.original?.organization?.image}
                        name={row.original?.organization?.name}
                        className="size-8"
                    />
                    {row.original.organization?.name}
                </div>
            ),
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
        // {
        //     id: "diagnoses",
        //     accessorKey: "donor.diagnoses",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Diagnoses"/>
        //     ),
        //     cell: ({row}) => (
        //         <ul className="flex flex-col gap-2">
        //             {row.original.donor?.diagnoses?.map((diagnosis: string, index: number) => (
        //                 <li key={index} className="line-clamp-2">
        //                     {diagnosis}
        //                 </li>
        //             ))}
        //         </ul>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Diagnoses"
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
            accessorKey: "institution.name",
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
        //     id: "description",
        //     accessorKey: "description",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Description"/>
        //     ),
        //     cell: ({row}) => (
        //         <div className="line-clamp-2 w-[200px]">
        //             {row.original.description}
        //         </div>
        //     ),
        //     meta: {
        //         label: "Description"
        //     },
        //     enableHiding: true,
        // },
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
        //         variant: "multiSelect",
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
        //         variant: "multiSelect",
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
        //         variant: "multiSelect",
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
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Collection Date",
        //         variant: "dateRange",
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true,
        //     }
        // },
        // {
        //     id: "donorId",
        //     accessorKey: "donor.id",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Donor Id"/>
        //     ),
        // },
        // {
        //     id: "diagnoses",
        //     accessorKey: "biosample.donor.diagnoses",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Diagnoses"/>
        //     ),
        //     cell: ({row}) => (
        //         <ul className="flex flex-col gap-2">
        //             {/* {row.original.biosample?.donor?.diagnoses?.map((diagnosis: string, index: number) => (
        //                 <li key={index} className="line-clamp-2">
        //                     {diagnosis}
        //                 </li>
        //             ))} */}
        //         </ul>
        //     ),
        // },
        // {
        //     id: "age",
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
        // {
        //     id: "sex",
        //     accessorKey: "donor.sex",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Sex"/>
        //     ),
        //     cell: ({row}) => (
        //         <>
        //             {DONOR_SEX_OPTIONS.find(t => t.value === row.original.donor?.sex)?.label}
        //         </>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Sex",
        //         variant: "multiSelect",
        //         options: DONOR_SEX_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true,
        //     }
        // },
        // {
        //     id: "gender",
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
        //         variant: "multiSelect",
        //         options: DONOR_GENDER_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true
        //     }
        // },
        // {
        //     id: "race",
        //     accessorKey: "donor.race",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Race"/>
        //     ),
        //     cell: ({row}) => (
        //         <>
        //             {DONOR_RACE_OPTIONS.find(t => t.value === row.original.donor?.race)?.label}
        //         </>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Race",
        //         variant: "multiSelect",
        //         options: DONOR_RACE_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true
        //     }
        // },
        // {
        //     id: "ethnicity",
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
        //         variant: "multiSelect",
        //         options: DONOR_ETHNICITY_OPTIONS,
        //         icon: CircleDashed,
        //         showInAdvancedOnly: true,
        //     }
        // },
        // {
        //     id: "height",
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
        //     id: "weight",
        //     accessorKey: "donor.weight",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Weight"/>
        //     ),
        //     enableHiding: true,
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
        //     id: "medications",
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
        //     id: "treatments",
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
        // {
        //     id: "private",
        //     accessorKey: "private",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Visibility"/>
        //     ),
        //     cell: ({row}) => (
        //         <div>
        //             {row.getValue("private") ? 'Private' : 'Published'}
        //         </div>
        //     ),
        //     enableHiding: true,
        //     enableColumnFilter: true,
        //     meta: {
        //         label: "Visibility",
        //         variant: "select",
        //         options: [
        //             {
        //                 label: "Private",
        //                 value: "true",
        //             }, {
        //                 label: "Published",
        //                 value: "false",
        //             }
        //         ],
        //         icon: CircleDashed,
        //     },
        // },
        // {
        //     id: "milestones",
        //     accessorKey: "milestones",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Linked Projects"/>
        //     ),
        //     cell: ({row}) => (
        //         <ul className="flex flex-col gap-2">
        //             {row.original.milestones?.map((milestone: any, index: number) => (
        //                 <li key={index} className="line-clamp-2">
        //                     {milestone.milestone?.title || undefined}
        //                 </li>
        //             ))}
        //         </ul>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Linked Projects"
        //     }
        // },
        // {
        //     id: "contacts",
        //     accessorKey: "contacts",
        //     header: ({column}) => (
        //         <DataTableColumnHeader column={column} title="Contacts"/>
        //     ),
        //     cell: ({row}) => (
        //         <ul className="flex flex-col gap-2">
        //             {row.original.contacts?.map((contact: any, index: number) => (
        //                 <li key={index}>
        //                     {contact.name || contact.email || contact.affiliation}
        //                 </li>
        //             ))}
        //         </ul>
        //     ),
        //     enableHiding: true,
        //     meta: {
        //         label: "Contacts"
        //     }
        // },
    ]

    // const actionsColumn: ColumnDef<any>[] = [
    //     {
    //         id: "actions",
    //         // cell: ({row}) => <AssetActionsMenu tool={row.original} type={'biosample'}/>,
    //         cell: ({row}) => <></>,
    //         enableHiding: false,
    //     },
    // ]

    // Temporarily hide additional biobank columns from users on production
    // This can be removed, and all columns enabled once our biobank feature is built out
    if (process.env.NEXT_PUBLIC_NODE_ENV === "production") {
        return columns.filter(column => column.id && !hiddenColumnIds.includes(column.id))
    }

    // return [...columns, ...actionsColumn]
    return columns
}
