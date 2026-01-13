import UserOnboardingForm from "~web/components/user-onboarding-form";
import {Separator} from "@comend/components/ui/separator";

export default function UserOnboardingPage() {
    return (
        <main className="w-full max-w-7xl mx-auto">
            <div className="space-y-4 w-full">
                <div className="space-y-2">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-xl font-semibold">
                            Profile onboarding: about you
                        </h1>
                    </div>
                </div>

                <Separator/>
                <UserOnboardingForm/>
            </div>
        </main>
    )
}
