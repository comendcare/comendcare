import {getSession} from "@/lib/auth";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import OrganizationSettingsPage from "@/components/organization-settings-page";
import {Organization} from "@prisma/client";


export default async function OrganizationSettings() {
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

    return (
        <OrganizationSettingsPage organization={organization as Organization}/>
    )
}