import {Separator} from "@/components/ui/separator";
import FinancesOnboardingForm from "@/components/finances-onboarding-form";
import {TooltipProvider} from "@/components/ui/tooltip";


export default function CreateOrganizationFinancesPage() {
    return (
        <TooltipProvider>
            <div className="flex flex-row mx-auto w-full min-h-screen justify-center py-8 sm:px-6 lg:px-8 gap-x-4">
                <main className="flex flex-row space-x-8 w-full max-w-7xl mx-auto">
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
                            nextLink={"/app/marketplace/cro"}
                            previousLink={"/app/create/new-organization-research"}
                            showSkip={false}
                        />
                    </div>
                </main>
            </div>
        </TooltipProvider>
    )
}
