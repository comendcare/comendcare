import OrganizationOnboardingForm from "@/components/organization-onboarding-form";
import {Separator} from "@/components/ui/separator";
import {Timer} from "lucide-react";

export default function OrganizationOnboardingPage() {
    return (
        <main className="flex flex-row space-x-8 w-full max-w-7xl mx-auto">
            <div className="space-y-4 w-full">
                <div className="space-y-2">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-xl font-semibold">
                            Organization onboarding
                        </h1>

                        <p className="inline-flex flex-row justify-center items-center gap-x-2 text-xl">
                            <Timer/>
                            {`Estimated time: 5 min`}
                        </p>
                    </div>
                    <p>
                        {`We have a few questions about your organization to help get your profile started.
                    You can join an organization if it already exists on Comend, or create a new one.
                    `}
                    </p>
                </div>

                <Separator/>
                <OrganizationOnboardingForm/>
            </div>
        </main>
    )
}