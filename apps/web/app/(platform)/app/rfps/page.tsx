import React from "react"
import NoOrganization from "@/components/no-organization"
import {getSession} from "@/lib/auth"
import {getOrganizationFromOrganizationId} from "@/lib/fetchers"
import { PrivateRFPsPage } from "@/components/private-rfps-page"

export default async function RFPsPage() {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />
    return <PrivateRFPsPage />
}