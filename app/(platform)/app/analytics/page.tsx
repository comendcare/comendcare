import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import PAGDashboardAnalyticsTab from "@/components/pag-dashboard-analytics-tab";
import UnverifiedOrganizationPage from "@/components/unverified-organization-page";
import {getOrganizationFromOrganizationId} from "@/lib/fetchers";
import {getSession} from "@/lib/auth";
import NoOrganization from "@/components/no-organization";
import React from "react";
import { IncorporationStatus } from "@prisma/client";

export default async function AnalyticsPage() {
    const session = await getSession()

    let organization = null
    if (session?.user.organizationId) {
        const response = await getOrganizationFromOrganizationId(session?.user.organizationId, {
            id: true,
            public: true,
            verified: true,
            published: true,
            name: true,
            description: true,
            contactEmail: true,
            logo: true,
            font: true,
            image: true,
            headerImage: true,
            biopharmaConsentSettings: true,
            subdomain: true,
            customDomain: true,
            statedGoal: true,
            yearFounded: true,
            incorporationStatus: true,
            therapeuticsOfInterest: true,
            therapeuticsInDevelopment: true,
            website: true,
            moneyRaised: true,
            moneyDeployed: true,
            researchBudget: true,
            // address1                  String?
            // address2                  String?
            // formattedAddress          String?
            // city                      String?
            // region                    String?
            // postalCode                String?
            // country                   String?
            // lat                       String?
            // lng                       String?
            createdAt: true,
            updatedAt: true,
            user: true,
            userId: true,
            roadmaps: true,
            members: true,
            clients: true,
            invitations: true,
            membershipRequests: true,
            conditions: true,
            kanban: true,
            milestones: true,
            platformNotifications: true,
            reviews: true,
            savedCompanies: true,
            tools: true,
            rfps: true,
            metadata: true
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
            <main className="flex flex-col space-y-4 justify-start items-start w-full h-full max-w-7xl mx-auto p-8">
                <Tabs defaultValue="general" className="space-y-4 w-full">
                    <TabsList>
                        <TabsTrigger value="general">
                            Analytics
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="analytics" className="space-y-4 w-full">
                        <PAGDashboardAnalyticsTab/>
                    </TabsContent>
                </Tabs>
            </main>
        )
    } else {
        return (
            <NoOrganization/>
        );
    }
}
