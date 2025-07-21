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
    COUNTRY_OPTIONS,
    DONOR_ETHNICITY_OPTIONS,
    DONOR_GENDER_OPTIONS,
    DONOR_RACE_OPTIONS,
    DONOR_SEX_OPTIONS,
    SAMPLE_PRESERVATION_METHOD_OPTIONS,
    SAMPLE_TRANSPORT_METHOD_OPTIONS,
    TOOL_TYPE_OPTIONS
} from "@comend/lib/types";
import {MilestoneTypeBadge} from "@comend/components/milestone-type-badge";
import {AssetActionsMenu} from "comend-pag-platform/components/tool-actions-menu";
import {revalidate} from "@comend/lib/revalidate";
import {Button} from "@comend/components/ui/button";
import {createOrUpdateAsset} from "@comend/lib/actions";
import {useSession} from "next-auth/react";
import {usePathname} from "next/navigation";

// columns temporarily hidden on production
const hiddenColumnIds = [
    'diagnoses',
    'gene',
    'variant',
    'biosample.volume',
    'biosample.currentCountry',
    'biosample.countryOfCollection',
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
    const {data: session} = useSession()
    const pathname = usePathname()

    const columns: ColumnDef<any>[] = [
        {
            id: "types",
            accessorKey: "types",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Type"/>
            ),
            cell: ({ row }) => (
            <>
                {(row.original.types || []).map((type: string) => {
                const typeOption = TOOL_TYPE_OPTIONS.find(t => t.id === type)
                return (
                    <MilestoneTypeBadge label={typeOption.label}/>
                )
                })}
            </>
            ),
            enableHiding: true,
            enableColumnFilter: true,
            meta: {
                label: "Type",
                variant: "multiSelect",
                options: TOOL_TYPE_OPTIONS.filter(type => type.type === "biosample").map(type => ({
                    label: type.label, 
                    value: type.id,
                })),
                icon: CircleDashed,
            },
        },
        {
            id: "diagnoses",
            accessorKey: "biosample.donor.diagnoses",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Diagnoses"/>
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.biosample?.donor?.diagnoses?.map((diagnosis: string, index: number) => (
                        <li key={index} className="line-clamp-2">
                            {diagnosis}
                        </li>
                    ))}
                </ul>
            ),
            enableHiding: true,
            meta: {
                label: "Diagnoses"
            }
        },
        {
            id: "biosample.gene",
            accessorKey: "biosample.gene",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Gene"/>
            ),
            enableHiding: true,
            meta: {
                label: "Gene"
            }
        },
        {
            id: "biosample.variant",
            accessorKey: "biosample.variant",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Variant"/>
            ),
            enableHiding: true,
            meta: {
                label: "Variant"
            }
        },
        {
            // NOTE: in order for filters to access the proper nested database object the path to
            // the nested object must be defined in BOTH the id & accessorKey
            id: "biosample.quantity",
            accessorKey: "biosample.quantity",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Available Quantity"/>
            ),
            cell: ({row}) => (
                <>
                    {
                        row.original.biosample.quantity >= 0 && 
                        row.original.biosample.quantityUnit && 
                        `${row.original.biosample.quantity}${row.original.biosample.quantityUnit}`
                    }
                </>
            ),
            enableColumnFilter: true,
            meta: {
                label: "Available Quantity",
                // variant: "range",
                // range: [0, 1000],
                // unit: 'ml'
            },
        },
        {
            id: "description",
            accessorKey: "description",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Description" />
            ),
            cell: ({ row }) => (
                <div className="line-clamp-3">
                    {row.original.description}
                </div>
            ),
            meta: {
            label: "Description"
            },
            enableHiding: true,
        },
        {
            // NOTE: in order for filters to access the proper nested database object the path to
            // the nested object must be defined in BOTH the id & accessorKey (e.g. biosample.currentCountry)
            id: "biosample.currentCountry",
            accessorKey: "biosample.currentCountry",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Current Location"/>
            ),
            cell: ({row}) => (
                <>
                    {COUNTRY_OPTIONS.find(t => t.value === row.original.biosample?.currentCountry)?.label}
                </>
            ),
            enableColumnFilter: true,
            meta: {
                label: "Current Location",
                variant: "select",
                options: COUNTRY_OPTIONS,
                icon: CircleDashed,
            },
        },
        {
            // NOTE: in order for filters to access the proper nested database object the path to
            // the nested object must be defined in BOTH the id & accessorKey (e.g. biosample.countryOfCollection)
            id: "biosample.countryOfCollection",
            accessorKey: "biosample.countryOfCollection",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Location of Collection"/>
            ),
            cell: ({row}) => (
                <>
                    {COUNTRY_OPTIONS.find(t => t.value === row.original.biosample?.countryOfCollection)?.label}
                </>
            ),
            enableColumnFilter: true,
            meta: {
                label: "Location of Collection",
                variant: "select",
                options: COUNTRY_OPTIONS,
                icon: CircleDashed,
            },
        },
        {
            id: "institution",
            accessorKey: "biosample.institution.name",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Institution"/>
            ),
            cell: ({row}) => (
                <a href={row.original.biosample?.institution?.website}>
                    {SAMPLE_PRESERVATION_METHOD_OPTIONS.find(t => t.value === row.original.biosample?.institution?.name)?.label}
                </a>
            ),
            enableHiding: true,
            meta: {
                label: "Institution"
            }
        },
        {
            id: "pathology",
            accessorKey: "biosample.pathology",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Pathology"/>
            ),
            enableHiding: true,
            meta: {
                label: "Pathology"
            }
        },
        {
            id: "preservationMethod",
            accessorKey: "biosample.preservationMethod",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Preservation Method"/>
            ),
            cell: ({row}) => (
                <>
                    {SAMPLE_PRESERVATION_METHOD_OPTIONS.find(t => t.value === row.original.biosample?.preservationMethod)?.label}
                </>
            ),
            enableHiding: true,
            meta: {
                label: "Preservation Method"
            }
        },
        {
            id: "anatomicalSite",
            accessorKey: "biosample.anatomicalSite",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Anatomical Site"/>
            ),
            enableHiding: true,
            meta: {
                label: "Anatomical Site"
            }
        },
        {
            id: "methodOfTransport",
            accessorKey: "biosample.methodOfTransport",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Method of Transport"/>
            ),
            cell: ({row}) => (
                <>
                    {SAMPLE_TRANSPORT_METHOD_OPTIONS.find(t => t.value === row.original.biosample?.methodOfTransport)?.label}
                </>
            ),
            enableHiding: true,
            meta: {
                label: "Method of Transport"
            }
        },
        {
            id: "collectionDate",
            accessorKey: "biosample.collectionDate",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Collection Date"/>
            ),
            enableHiding: true,
            meta: {
                label: "Collection Date"
            }
        },
        {
            id: "donorId",
            accessorKey: "biosample.donor.id",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Donor Id"/>
            ),
            enableHiding: true,
            meta: {
                label: "Donor Id"
            }
        },
        {
            id: "age",
            accessorKey: "biosample.donor.age",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Age at Collection"/>
            ),
            enableHiding: true,
            meta: {
                label: "Age at Collection"
            }
        },
        {
            id: "sex",
            accessorKey: "biosample.donor.sex",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Sex"/>
            ),
            cell: ({row}) => (
                <>
                    {DONOR_SEX_OPTIONS.find(t => t.value === row.original.biosample?.donor?.sex)?.label}
                </>
            ),
            enableHiding: true,
            meta: {
                label: "Sex"
            }
        },
        {
            id: "gender",
            accessorKey: "biosample.donor.gender",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Gender"/>
            ),
            cell: ({row}) => (
                <>
                    {DONOR_GENDER_OPTIONS.find(t => t.value === row.original.biosample?.donor?.gender)?.label}
                </>
            ),
            enableHiding: true,
            meta: {
                label: "Gender"
            }
        },
        {
            id: "race",
            accessorKey: "biosample.donor.race",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Race"/>
            ),
            cell: ({row}) => (
                <>
                    {DONOR_RACE_OPTIONS.find(t => t.value === row.original.biosample?.donor?.race)?.label}
                </>
            ),
            enableHiding: true,
            meta: {
                label: "Race"
            }
        },
        {
            id: "ethnicity",
            accessorKey: "biosample.donor.ethnicity",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Ethnicity"/>
            ),
            cell: ({row}) => (
                <>
                    {DONOR_ETHNICITY_OPTIONS.find(t => t.value === row.original.biosample?.donor?.ethnicity)?.label}
                </>
            ),
            enableHiding: true,
            meta: {
                label: "Ethnicity"
            }
        },
        {
            id: "height",
            accessorKey: "biosample.donor.height",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Height"/>
            ),
            enableHiding: true,
            meta: {
                label: "Height"
            }
        },
        {
            id: "weight",
            accessorKey: "biosample.donor.weight",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Weight"/>
            ),
            enableHiding: true,
            meta: {
                label: "Weight"
            }
        },
        {
            id: "bmi",
            accessorKey: "biosample.donor.bmi",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="BMI"/>
            ),
            enableHiding: true,
            meta: {
                label: "BMI"
            }
        },
        {
            id: "medications",
            accessorKey: "biosample.donor.medications",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Medications"/>
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.biosample?.donor?.medications?.map((medication: string, index: number) => (
                        <li key={index} className="line-clamp-2">
                            {medication}
                        </li>
                    ))}
                </ul>
            ),
            enableHiding: true,
            meta: {
                label: "Medications"
            }
        },
        {
            id: "treatments",
            accessorKey: "biosample.donor.treatments",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Medical Treatments"/>
            ),
            cell: ({row}) => (
                <ul className="flex flex-col gap-2">
                    {row.original.biosample?.donor?.treatments?.map((treatment: string, index: number) => (
                        <li key={index} className="line-clamp-2">
                            {treatment}
                        </li>
                    ))}
                </ul>
            ),
            enableHiding: true,
            meta: {
                label: "Medical Treatments"
            }
        },


        {
            id: "private",
            accessorKey: "private",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Visibility" />
            ),
            cell: ({ row }) => (
                <div>
                    {row.getValue("private") ? 'Private' : 'Public'}
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
                label: "Public", 
                value: "false",
                }
            ],
            icon: CircleDashed,
            },
        },
        {
            id: "milestones",
            accessorKey: "milestones",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Linked Projects" />
            ),
            cell: ({ row }) => (
                <ul className="flex flex-col gap-2">
                    {row.original.milestones?.map((milestone: any, index: number) => (
                        <li key={index} className="line-clamp-2">
                            {milestone.milestone?.title || undefined}
                        </li>
                    ))}
                </ul>
            ),
            enableHiding: true,
            meta: {
            label: "Linked Projects"
            }
        },
        {
            id: "contacts",
            accessorKey: "contacts",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Contacts" />
            ),
            cell: ({ row }) => (
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
            label: "Contacts"
            }
        },
        {
            id: "links",
            accessorKey: "links",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Links" />
            ),
            cell: ({ row }) => (
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
        {
            id: "pinned",
            accessorKey: "pinned",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Pinned"/>
            ),
            cell: ({ row }) => (
                <Button 
                onClick={
                    async () => {
                    await createOrUpdateAsset(
                        session?.user.organizationId, 
                        {
                        id: row.original.id,
                        pinned: !row.original.pinned
                        }
                    )
                    revalidate(pathname)
                    }
                }
                variant={'ghost'}
                >
                    {row.original.pinned ? <Pin fill="currentColor" className="h-4 w-4"/> : <Pin className="h-4 w-4"/>}
                </Button>
            ),
            enableHiding: true,
            meta: {
            label: "Pinned"
            }
        },
        {
            id: "actions",
            cell: ({row}) => <AssetActionsMenu tool={row.original} type={'biosample'}/>,
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
