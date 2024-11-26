import UserOnboardingForm from "@/components/user-onboarding-form";
import {Separator} from "@/components/ui/separator";

export default function UserOnboardingPage() {
    return (
        <main className="w-full max-w-7xl mx-auto">
            <div className="space-y-4 w-1/2">
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold">Profile onboarding</h1>
                    <p>
                        {`This section is all about you and your profile.`}
                    </p>
                </div>

                <Separator/>
                <UserOnboardingForm/>
            </div>
        </main>
    )
}