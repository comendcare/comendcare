import React from "react";
import UnverifiedOrganizationPage from "~web/components/unverified-organization-page";
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers";
import {getSession} from "@/packages/lib/auth";
import NoOrganization from "~web/components/no-organization";
import {TooltipProvider} from "@comend/components/ui/tooltip";
import PAGSettingsMembersTab from "~web/components/pag-settings-members-tab"
import PAGSettingsInvitationsTab from "~web/components/pag-settings-invitations-tab"
import {Invitation} from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
    const session = await getSession()
    const orgId = session?.user?.organizationId;

    let organization = null
    // let dbMilestones = []
    if (orgId) {
        const response = await getOrganizationFromOrganizationId(session?.user.organizationId, {
            id: true,
            public: true,
            verified: true,
            published: true,
            name: true,
            members: {
                include: {
                    user: true
                }
            },
            invitations: true,
            membershipRequests: true,
        })
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
                <div className="flex flex-col space-y-4 justify-start items-start w-full h-full max-w-7xl mx-auto p-8">
                    <PAGSettingsMembersTab members={organization.members}/>
                    <PAGSettingsInvitationsTab organization={organization}/>
                </div>
            </TooltipProvider>
        )
    } else {
        return (
            <NoOrganization/>
        );
    }
}
