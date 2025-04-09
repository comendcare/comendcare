import React from "react";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import {getSession} from "@/lib/auth";
import NoOrganization from "@/components/no-organization";
import {TooltipProvider} from "@/components/ui/tooltip";
import OrganizationSettingsTabs from "@/components/organization-settings-tabs";

export default async function SettingsPage() {
    const session = await getSession()

    let organization = null
    // let dbMilestones = []
    if (session?.user.organizationId) {
        const response = await getOrganizationFromOrganizationId(session?.user.organizationId)
        if (response.success) {
            organization = response.data
        } else {
            console.error(response.error)
        }
    }

    if (organization) {
        if (!organization.verified) {
            // Render unverified organization state
            return (
                <UnverifiedOrganizationPage organization={organization}/>
            );
        }
        return (
            <TooltipProvider>
                <OrganizationSettingsTabs organization={organization}/>
            </TooltipProvider>
        )
    } else {
        return (
            <NoOrganization/>
        );
    }
}
