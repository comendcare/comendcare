import UserOnboardingForm from "@/components/user-onboarding-form";
import {Separator} from "@/components/ui/separator";

export default function OrganizationOnboardingPage() {
    return (
        <main className="w-full max-w-7xl mx-auto">
            <div className="space-y-4 w-1/2">
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold">Profile onboarding</h1>
                    <p>
                        {`Welcome to onboarding! We have a few questions to better understand how we can help you.
                    All questions in this form are optional unless marked as (required).`}
                    </p>
                    <p className="font-semibold">
                        {`Nothing that you share here will be shared with others, and you have complete control of what info is made public on your organization profile and research plan.`}
                    </p>
                </div>

                <Separator/>
                <UserOnboardingForm/>
            </div>
        </main>
    )
}