import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import PAGDashboardAnalyticsTab from "@/components/pag-dashboard-analytics-tab";
import PAGDashboardMembersTab from "@/components/pag-dashboard-members-tab";
import PAGDashboardInvitationsTab from "@/components/pag-dashboard-invitations-tab";
import PAGDashboardDetailsTab from "@/components/pag-dashboard-details-tab";

export default function DashboardPage() {
    return (
        <main className="flex flex-col items-center w-full max-w-7xl mx-auto">
            <div className="w-full flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                </div>
                <Tabs defaultValue="analytics" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="analytics">
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="details">
                            Details
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
                    <TabsContent value="analytics">
                        <PAGDashboardAnalyticsTab/>
                    </TabsContent>
                    <TabsContent value="details">
                        <PAGDashboardDetailsTab/>
                    </TabsContent>
                    <TabsContent value="members" className="space-y-4">
                        <PAGDashboardMembersTab/>
                    </TabsContent>
                    <TabsContent value="invitations" className="space-y-4">
                        <PAGDashboardInvitationsTab/>
                    </TabsContent>
                    <TabsContent value="requests" className="space-y-4">
                        <PAGDashboardAnalyticsTab/>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    )
}