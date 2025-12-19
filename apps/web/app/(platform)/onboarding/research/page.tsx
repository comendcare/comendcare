import {Separator} from "@comend/components/ui/separator";
import {TooltipProvider} from "@comend/components/ui/tooltip";
import { getConditionsDataFromOrgId } from "@comend/lib/fetchers";
import ResearchOnboardingForm from "~web/components/research-onboarding-form";

export default async function OrganizationOnboardingResearchPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    let condition = undefined
    const orgId: string | undefined = typeof searchParams.id === 'string' ? searchParams.id : undefined
    if (orgId) {
        condition = await getConditionsDataFromOrgId(orgId, {
            name: true,
            diseaseCategories: true,
            causalGenes: true,
            numberOfPatientsEngaged: true,
        })
    }

    return (
        <TooltipProvider>
            <main className="w-full max-w-7xl mx-auto">
                <div className="space-y-4 w-full">
                    <div className="space-y-2">
                        <div className="flex flex-row justify-between">
                            <h1 className="text-xl font-semibold">
                                Condition onboarding
                            </h1>
                        </div>
                    </div>

                    <Separator/>
                    <ResearchOnboardingForm
                        organizationId={orgId}
                        conditionData={condition?.success && condition?.data?.length > 0 ? condition?.data[0] : undefined}
                        nextLink={orgId ? `/onboarding/finances?id=${orgId}` : `/onboarding/finances`}
                        previousLink={orgId ? `/onboarding/organization?id=${orgId}` : `/onboarding/organization`}
                        showSkip={false}
                    />
                </div>
            </main>
        </TooltipProvider>
    )
}
