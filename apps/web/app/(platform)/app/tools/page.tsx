import React from "react"
import { getSession } from "~web/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { redirect } from "next/navigation"

export default async function AssetsPage() {
    const session = await getSession()
    const orgId = session?.user.organizationId

    if (!orgId) return <NoOrganization />
    redirect("/app/tools/biosample")
}
