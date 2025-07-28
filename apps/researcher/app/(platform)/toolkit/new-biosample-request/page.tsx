"use client"

import {useSearchParams} from 'next/navigation'
import MaterialAccessRequestForm from "~researcher/components/material-access-request-form"


export default function NewRequestPage() {
    const searchParams = useSearchParams()
    const idsParam = searchParams.get("ids")
    const ids = idsParam ? idsParam.split(",") : []

    return (
        <MaterialAccessRequestForm materialIds={ids} />
    )
}
