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
            name: true,
            subdomain: true,
            moneyRaised: true,
            // moneyDeployed: true,
            // researchBudget: true,
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
