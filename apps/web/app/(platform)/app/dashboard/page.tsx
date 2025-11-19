import PAGDashboardAnalyticsTab from "~web/components/pag-dashboard-analytics-tab";
import UnverifiedOrganizationPage from "~web/components/unverified-organization-page";
import {getOrganizationFromOrganizationId} from "@comend/lib/fetchers";
import {getSession} from "@comend/lib/auth";
import NoOrganization from "~web/components/no-organization";
import React from "react";
import Image from "next/image";
import CreateOrJoinOrganizationButton from "~web/components/create-or-join-organization-button";

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
            createdAt: true,
            updatedAt: true,
            user: true,
            userId: true,
            roadmaps: true,
            members: true,
            clients: true,
            invitations: true,
            membershipRequests: true,
            kanban: true,
            milestones: true,
            platformNotifications: true,
            reviews: true,
            savedCompanies: true,
            tools: true,
            rfps: true,
            conditions: {
                include: {
                    condition: true
                }
            },
            biosamples: true,
            diseaseModel: true,
            materialAndDataAccessRequests: true,
            metadata: true
        })
        if (response.success) {
            organization = response.data
        } else {
            console.error(response.error)
        }
    }

    if (!session?.user.organizationId) {
        return <div className="h-full flex flex-col items-center justify-center py-20">
            <Image
                alt="No organization selected"
                src="https://illustrations.popsy.co/gray/keynote-presentation.svg"
                width={400}
                height={400}
                className="dark:hidden"
            />
            <Image
                alt="No organization selected"
                src="https://illustrations.popsy.co/white/keynote-presentation.svg"
                width={400}
                height={400}
                className="hidden dark:block"
            />
            <p className="font-title text-2xl text-stone-600 dark:text-stone-400">
                {`You're not part of an organization yet.`}
            </p>
            <div className="mt-8">
                <CreateOrJoinOrganizationButton/>
            </div>
        </div>
    }

    if (organization) {
        if (!organization.verified) {
            return (
                <UnverifiedOrganizationPage organization={organization}/>
            );
        }
        return (
            <main className="flex flex-col space-y-4 justify-start items-start w-full h-full max-w-7xl mx-auto p-8">
                <PAGDashboardAnalyticsTab organization={organization}/>
            </main>
        )
    } else {
        return (
            <NoOrganization/>
        );
    }
}
