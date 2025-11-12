"use client"

import {useSearchParams} from 'next/navigation'
import DataAccessRequestForm from "~researcher/components/data-access-request-form"


export default function NewMaterialAccessRequestPage() {
    const searchParams = useSearchParams()
    const idsParam = searchParams.get("ids")
    const ids = idsParam ? idsParam.split(",") : []

    return (
        <DataAccessRequestForm datasetIds={ids} />
    )
}
