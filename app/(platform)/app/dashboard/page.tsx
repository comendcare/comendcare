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
                <UnverifiedOrganizationPage organization={organization} />
            );
        }
        return (
            <main className="flex flex-col space-y-4 justify-center items-start w-full max-w-7xl mx-auto p-8">
                <div className="flex items-center justify-between space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                </div>
                <Tabs defaultValue="analytics" className="space-y-4 w-full">
                    <TabsList>
                        <TabsTrigger value="analytics">
                            Analytics
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
        )
    } else {
        return (
            <NoOrganizationPage/>
        );
    }
}