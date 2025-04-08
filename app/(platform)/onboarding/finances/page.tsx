import FinancesOnboardingForm from "@/components/finances-onboarding-form";
import {Separator} from "@/components/ui/separator";
import {TooltipProvider} from "@/components/ui/tooltip";

export default function FinancesOnboardingPage() {
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
                        nextLink={"/app/marketplace/service-providers"}
                        previousLink={"/onboarding/research"}
                        showSkip={false}
                    />
                </div>
            </main>
        </TooltipProvider>
    )
}
