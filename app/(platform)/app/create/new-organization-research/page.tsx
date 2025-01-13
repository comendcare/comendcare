import {Separator} from "@/components/ui/separator";
import ResearchOnboardingForm from "@/components/research-onboarding-form";


export default function CreateOrganizationResearchPage() {
    return (
        <div className="flex flex-row mx-auto w-full min-h-screen justify-center py-8 sm:px-6 lg:px-8 gap-x-4">
            <main className="flex flex-row space-x-8 w-full max-w-7xl mx-auto">
                <div className="space-y-4 w-full">
                    <div className="space-y-2">
                        <div className="flex flex-row justify-between">
                            <h1 className="text-xl font-semibold">
                                Research onboarding
                            </h1>

                        </div>
                        <p>
                            {`
                        We have some questions about the nature of your disorder, it's demographic, and the ongoing efforts towards treatments and cures.
                        `}
                        </p>
                    </div>

                    <Separator/>
                    <ResearchOnboardingForm
                        nextLink={"/app/create/new-organization-finances"}
                        previousLink={"/app/create/new-organization"}
                        showSkip={false}
                    />
                </div>
            </main>
        </div>
    )
}
