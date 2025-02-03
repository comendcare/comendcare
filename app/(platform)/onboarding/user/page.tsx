import UserOnboardingForm from "@/components/user-onboarding-form";
import {Separator} from "@/components/ui/separator";
import {Timer} from "lucide-react";

export default function UserOnboardingPage() {
    return (
        <main className="w-full max-w-7xl mx-auto">
            <div className="space-y-4 w-full">
                <div className="space-y-2">
                    <div className="flex flex-row justify-between">
                        <h1 className="text-xl font-semibold">
                            Profile Onboarding: About You
                        </h1>

                        <p
                            className="inline-flex flex-row justify-center items-center gap-x-2 w-min text-base truncate rounded-md bg-stone-100 px-4 py-2 font-medium text-stone-600 transition-colors dark:bg-stone-800 dark:text-stone-400"
                        >
                            <Timer/>
                            {`1 min`}
                        </p>
                    </div>
                </div>

                <Separator/>
                <UserOnboardingForm/>
            </div>
        </main>
    )
}
