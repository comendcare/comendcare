import {Separator} from "@/components/ui/separator";
import {Skeleton} from "@/components/ui/skeleton";

export default function OnboardingWelcomePage() {
    return (
        <main className="flex flex-row space-x-8 w-full max-w-7xl mx-auto">
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
            </div>
            <div className="space-y-4 w-1/2">
                <h1 className="text-xl font-semibold">
                    {`We'll show you what your information will be used to to.`}
                </h1>
                <div className="flex flex-col space-y-3">
                    <Skeleton className="h-[125px] w-full rounded-xl"/>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full"/>
                        <Skeleton className="h-4 w-[200px]"/>
                    </div>
                </div>
            </div>
        </main>
    )
}