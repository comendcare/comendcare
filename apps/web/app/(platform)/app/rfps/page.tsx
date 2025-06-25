import React from "react"
import NoOrganization from "~web/components/no-organization"
import {getSession} from "@comend/lib/auth"
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers"
import { PrivateRFPsPage } from "~web/components/private-rfps-page"

export default async function RFPsPage() {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />
    return <PrivateRFPsPage />
}
