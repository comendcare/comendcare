"use client"

import {useSearchParams} from 'next/navigation'
import MaterialAndDataAccessRequestForm from "~researcher/components/material-data-access-request-form"


export default function NewRequestPage() {
    const searchParams = useSearchParams()
    const idsParam = searchParams.get("ids")
    const ids = idsParam ? idsParam.split(",") : []

    return (
        <MaterialAndDataAccessRequestForm materialIds={ids} />
    )
}
