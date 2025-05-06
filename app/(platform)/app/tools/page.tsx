import React from "react"
import NoOrganization from "@/components/no-organization"
import {getSession} from "@/lib/auth"
import {getOrganizationFromOrganizationId} from "@/lib/fetchers"
import { PrivateToolsPage } from "@/components/private-tools-page"

export default async function ToolsPage() {
    const session = await getSession()

    let organization = null
    if (session?.user.organizationId) {
        const response = await getOrganizationFromOrganizationId(session?.user.organizationId)
        if (response.success) {
            organization = response.data
        } else {
            console.error(response.error)
        }
    }

    if (organization) return <PrivateToolsPage />
    return <NoOrganization/>
}