import React from "react"
import NoOrganization from "@/components/no-organization"
import {getSession} from "@/lib/auth"
import {getOrganizationFromOrganizationId} from "@/lib/fetchers"
import { PrivateRFPsPage } from "@/components/private-rfps-page"

export default async function RFPsPage() {
    const session = await getSession()

    let organization = null
    if (session?.user.organizationId) {
        const response = await getOrganizationFromOrganizationId(session?.user.organizationId, {id: true})
        if (response.success) {
            organization = response.data
        } else {
            console.error(response.error)
        }
    }

    if (organization) return <PrivateRFPsPage />
    return <NoOrganization/>
}