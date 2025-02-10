import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import PAGDashboardAnalyticsTab from "@/components/pag-dashboard-analytics-tab";
import PAGDashboardMembersTab from "@/components/pag-dashboard-members-tab";
import PAGDashboardInvitationsTab from "@/components/pag-dashboard-invitations-tab";
import PAGDashboardRequestsTab from "@/components/pag-dashboard-requests-tab";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import {getSession} from "@/lib/auth";
import NoOrganizationPage from "@/components/no-organization-page";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import React from "react";

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
                    <Tabs defaultValue="members" className="space-y-4 w-full">
                        <TabsList>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger disabled>
                                    <TabsTrigger value="analytics" disabled>
                                        Analytics
                                    </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {`Coming soon!`}
                                </TooltipContent>
                            </Tooltip>
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
                        <TabsContent value="analytics" className="space-y-4 w-full">
                            <PAGDashboardAnalyticsTab/>
                        </TabsContent>
                        <TabsContent value="members" className="space-y-4 w-full">
                            <PAGDashboardMembersTab/>
                        </TabsContent>
                        <TabsContent value="invitations" className="space-y-4 w-full">
                            <PAGDashboardInvitationsTab/>
                        </TabsContent>
                        <TabsContent value="requests" className="space-y-4 w-full">
                            <PAGDashboardRequestsTab/>
                        </TabsContent>
                    </Tabs>
                </main>
            </TooltipProvider>
        )
    } else {
        return (
            <NoOrganizationPage/>
        );
    }
}
