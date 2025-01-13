import ResearchOnboardingForm from "@/components/research-onboarding-form";
import {Timer} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {FaQuestionCircle} from "react-icons/fa";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";


export default function OrganizationOnboardingResearchPage() {
    return (
        <TooltipProvider>
            <main className="w-full max-w-7xl mx-auto">
                <div className="space-y-4 w-full">
                    <div className="space-y-2">
                        <div className="flex flex-row justify-between">
                            <h1 className="text-xl font-semibold">
                                Condition onboarding
                            </h1>

                            <p
                                className="inline-flex flex-row justify-center items-center gap-x-2 w-min text-base truncate rounded-md bg-stone-100 px-4 py-2 font-medium text-stone-600 transition-colors dark:bg-stone-800 dark:text-stone-400"
                            >
                                <Timer/>
                                {`< 6 min`}
                            </p>
                        </div>
                        <p>
                            {`
                        We have some questions about the nature of your disorder, it's demographic, and the ongoing efforts towards treatments and cures.
                        `}
                            {`Hover over the `}
                            <span className="inline-flex items-center">
                                {" "}
                                <Tooltip delayDuration={0}>
                                    <TooltipTrigger>
                                        <FaQuestionCircle className="h-4 inline-block align-baseline mx-1"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Hello there!</p>
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                            {` if you're wondering why we need to know something.`}
                        </p>
                    </div>

                    <Separator/>
                    <ResearchOnboardingForm
                        nextLink={"/onboarding/finances"}
                        previousLink={"/onboarding/organization"}
                        showSkip={true}
                    />
                </div>
            </main>
        </TooltipProvider>
    )
}