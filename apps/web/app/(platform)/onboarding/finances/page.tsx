import {Separator} from "@comend/components/ui/separator";
import {TooltipProvider} from "@comend/components/ui/tooltip";
import { getOrganizationFromOrganizationId } from "@comend/lib/fetchers";
import FinancesOnboardingForm from "~web/components/finances-onboarding-form";

export default async function FinancesOnboardingPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    let organization = undefined
    const orgId: string | undefined = typeof searchParams.id === 'string' ? searchParams.id : undefined
    if (orgId) {
        organization = await getOrganizationFromOrganizationId(orgId, {
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
            conditions: true,
            kanban: true,
            milestones: true,
            platformNotifications: true,
            reviews: true,
            savedCompanies: true,
            tools: true,
            rfps: true,
            metadata: true,
        })
    }

    return (
        <TooltipProvider>
            <main className="w-full max-w-7xl mx-auto">
                <div className="space-y-4 w-1/2">
                    <div className="space-y-2">
                        <div className="flex flex-row justify-between">
                            <h1 className="text-xl font-semibold">
                                Finances onboarding
                            </h1>

                            {/*<p*/}
                            {/*    className="inline-flex flex-row justify-center items-center gap-x-2 w-min text-base truncate rounded-md bg-stone-100 px-4 py-2 font-medium text-stone-600 transition-colors dark:bg-stone-800 dark:text-stone-400"*/}
                            {/*>*/}
                            {/*    <Timer/>*/}
                            {/*    {`< 2 min`}*/}
                            {/*</p>*/}
                        </div>
                    </div>

                    <Separator/>

                    <FinancesOnboardingForm
                        organizationData={organization?.data}
                        nextLink={"/app/dashboard"}
                        previousLink={orgId ? `/onboarding/research?id=${orgId}` : `/onboarding/research`}
                        showSkip={false}
                    />
                </div>
            </main>
        </TooltipProvider>
    )
}
