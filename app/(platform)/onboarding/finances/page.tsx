import FinancesOnboardingForm from "@/components/finances-onboarding-form";
import {Separator} from "@/components/ui/separator";
import {FaQuestionCircle} from "react-icons/fa";
import {TooltipProvider} from "@/components/ui/tooltip";
import {Timer} from "lucide-react";


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

                            <p
                                className="inline-flex flex-row justify-center items-center gap-x-2 w-min text-base truncate rounded-md bg-stone-100 px-4 py-2 font-medium text-stone-600 transition-colors dark:bg-stone-800 dark:text-stone-400"
                            >
                                <Timer/>
                                {`< 5 min`}
                            </p>
                        </div>
                        <p>
                            {`With these questions we're seeking to understand your organization's capacity for advancing research in topics relevant to your group.`}
                        </p>
                        <p className="font-semibold">
                            {`You choose what information is shared publicly. And, we will never share your data externally without your consent.`}
                        </p>
                    </div>

                    <Separator/>

                    <FinancesOnboardingForm
                        nextLink={"/app/profile"}
                        previousLink={"/onboarding/research"}
                        showSkip={true}
                    />
                </div>
            </main>
        </TooltipProvider>
    )
}