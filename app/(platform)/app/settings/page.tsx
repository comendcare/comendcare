import React from "react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import PAGDashboardAnalyticsTab from "@/components/pag-dashboard-analytics-tab";
import PAGSettingsMembersTab from "@/components/pag-settings-members-tab";
import PAGSettingsInvitationsTab from "@/components/pag-settings-invitations-tab";
import PAGSettingsRequestsTab from "@/components/pag-settings-requests-tab";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import {getSession} from "@/lib/auth";
import NoOrganization from "@/components/no-organization";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import OrganizationSettingsPage from "@/components/organization-settings-page";
import {Organization} from "@prisma/client";

export default async function DashboardPage() {
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
                <main className="flex flex-col space-y-4 justify-start items-start w-full h-full max-w-7xl mx-auto p-8">
                    <Tabs defaultValue="general" className="space-y-4 w-full">
                        <TabsList>
                            <TabsTrigger value="general">
                                General
                            </TabsTrigger>
                            <TabsTrigger value="members">
                                Members
                            </TabsTrigger>
                            <TabsTrigger value="invitations">
                                Invitations
                            </TabsTrigger>
                            <TabsTrigger value="requests">
                                Requests
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="space-y-4 w-full">
                            <OrganizationSettingsPage organization={organization as Organization}/>
                        </TabsContent>
                        <TabsContent value="members" className="space-y-4 w-full">
                            <PAGSettingsMembersTab/>
                        </TabsContent>
                        <TabsContent value="invitations" className="space-y-4 w-full">
                            <PAGSettingsInvitationsTab/>
                        </TabsContent>
                        <TabsContent value="requests" className="space-y-4 w-full">
                            <PAGSettingsRequestsTab/>
                        </TabsContent>
                    </Tabs>
                </main>
            </TooltipProvider>
        )
    } else {
        return (
            <NoOrganization/>
        );
    }
}
