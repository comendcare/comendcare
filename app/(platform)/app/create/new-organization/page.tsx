import OrganizationOnboardingForm from "@/components/organization-onboarding-form";
import {Separator} from "@/components/ui/separator";


export default function CreateOrganizationPage() {
    return (
        <div className="flex flex-row mx-auto w-full min-h-screen justify-center py-8 sm:px-6 lg:px-8 gap-x-4">
            <main className="flex flex-row space-x-8 w-full max-w-7xl mx-auto">
                <div className="space-y-4 w-full">
                    <div className="space-y-2">
                        <div className="flex flex-row justify-between">
                            <h1 className="text-xl font-semibold">
                                Organization Onboarding
                            </h1>
                        </div>
                        <p>
                            {`To help set up your profile, please answer a few questions about your organization. You can either join an existing organization on Comend or create a new one.`}
                        </p>
                    </div>

                    <Separator/>
                    <OrganizationOnboardingForm
                        previousLink={""}
                        nextLink={"/app/create/new-organization-research"}
                        showSkip={false}
                    />
                </div>
            </main>
        </div>
    )
}