import React from "react"
import { PrivateAssetsPage } from "@/components/private-assets-page"
import { getSession } from "@/lib/auth"
import NoOrganization from "@/components/no-organization"

export default async function AssetsPage() {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />
    return <PrivateAssetsPage />
}