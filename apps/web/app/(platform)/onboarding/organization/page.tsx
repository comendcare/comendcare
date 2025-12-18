import OrganizationOnboardingForm from "~web/components/organization-onboarding-form";
import {Separator} from "@comend/components/ui/separator";
import { getOrganizationFromOrganizationId } from "@comend/lib/fetchers";

export default async function OrganizationOnboardingPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    let organization = undefined
    console.log(`search params`, searchParams)
    if (typeof searchParams.id === 'string') {
        organization = await getOrganizationFromOrganizationId(searchParams.id, {
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
    }

    return (
        <main className="flex flex-row space-x-8 w-full max-w-7xl mx-auto">
            <div className="space-y-4 w-full">
                <div className="space-y-2">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-xl font-semibold">
                            Organization Onboarding
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
                <OrganizationOnboardingForm
                    organizationData={organization?.data}
                    previousLink={"/onboarding/user"}
                    nextLink={"/onboarding/research"}
                    showSkip={false}
                />
            </div>
        </main>
    )
}
