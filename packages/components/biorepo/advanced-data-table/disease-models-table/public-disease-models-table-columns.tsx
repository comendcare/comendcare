"use client";

import type {ColumnDef} from "@tanstack/react-table";
import {
    CircleDashed,
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
import { getDiagnosisTypes } from "@comend/lib/fetchers";
import { useEffect, useState } from "react";
import { Option } from "@comend/lib/types";
import { ProfilePhoto } from "@comend/components/profile-photo";

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
            id: "organization",
            accessorKey: "organization",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Organization"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center w-[200px]">
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
        {
            id: "condition",
            accessorKey: "condition",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Condition"/>
            ),
            cell: ({row}) => (
                <div className="flex gap-2 items-center">
                    <p>{(row.original.organization?.conditions || []).map((condition: any) => condition?.condition?.name) || 'No Condition'}</p>
                </div>
            ),
            enableHiding: true,
            meta: {
                label: "Condition"
            }
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
            meta: {
                label: "Gene"
            }
        },
        {
            id: "description",
            accessorKey: "description",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Description"/>
            ),
            cell: ({row}) => (
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
            id: "institution",
            accessorKey: "institution",
            header: ({column}) => (
                <DataTableColumnHeader column={column} title="Institution"/>
            ),
            cell: ({row}) => {
                if (row.original.institution?.website && row.original.institution?.name) {
                    return (
                        <Link className="underline" href={row.original.institution?.website}>
                            {row.original.institution?.name}
                        </Link>
                    )
                }
                if (row.original.institution?.name) return (<>{row.original.institution?.name}</>)
                return <></>
            },
            enableHiding: true,
            meta: {
                label: "Institution"
            }
        },
    ]

    // Temporarily hide additional biobank columns from users on production
    // This can be removed, and all columns enabled once our biobank feature is built out
    if (process.env.NEXT_PUBLIC_NODE_ENV === "production") {
        return columns.filter(column => column.id && !hiddenColumnIds.includes(column.id))
    }

    return columns
}
