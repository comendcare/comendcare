import ResearchOnboardingForm from "@/components/research-onboarding-form";
import {Timer} from "lucide-react";
import {Separator} from "@/components/ui/separator";


export default function OrganizationOnboardingResearchPage() {
    return (
        <main className="w-full max-w-7xl mx-auto">
            <div className="space-y-4 w-full">
                <div className="space-y-2">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-xl font-semibold">
                            Research onboarding
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
                    </p>
                </div>

                <Separator/>
                <ResearchOnboardingForm
                    nextLink={"/onboarding/finances"}
                    previousLink={"/app/profile"}
                    showSkip={true}
                />
            </div>
        </main>
    )
}