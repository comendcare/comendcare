import React from "react"
import { getSession } from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { PrivateDataToolsPage } from "~web/components/private-data-tools-page"

export default async function DataToolsPage() {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />
    return <PrivateDataToolsPage />
}
