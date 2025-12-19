import OrganizationOnboardingForm from "~web/components/organization-onboarding-form";
import {Separator} from "@comend/components/ui/separator";
import { getOrganizationFromOrganizationId } from "@comend/lib/fetchers";

export default async function OrganizationOnboardingPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    let organization = undefined
    const orgId: string | undefined = typeof searchParams.id === 'string' ? searchParams.id : undefined
    if (orgId) {
        organization = await getOrganizationFromOrganizationId(orgId, {
            description: true,
            name: true,
            yearFounded: true,
            contactEmail: true,
            subdomain: true,
            incorporationStatus: true,
            website: true,
            therapeuticsInDevelopment: true,
            therapeuticsOfInterest: true,
            metadata: true,
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
                    </div>
                </div>

                <Separator/>
                <OrganizationOnboardingForm
                    organizationData={organization?.data}
                    previousLink={"/onboarding/user"}
                    nextLink={orgId ? `/onboarding/research?id=${orgId}` : `/onboarding/research`}
                    showSkip={false}
                />
            </div>
        </main>
    )
}
