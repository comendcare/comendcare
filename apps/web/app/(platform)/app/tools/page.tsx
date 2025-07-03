import React from "react"
import { getSession } from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { PrivateAssetsPage } from "~web/components/private-assets-page"
import { redirect } from "next/navigation"

export default async function AssetsPage() {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />
    // return <PrivateAssetsPage />
    redirect("/app/tools/biosample")
}
