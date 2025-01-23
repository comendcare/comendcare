"use client"

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import Loading from "@/app/loading";

export default function OnboardingWelcomePage() {
    const {data: session, status} = useSession()
    const router = useRouter()

    if (status === "loading") {
        return <Loading />
    }

    return (
        <main className="flex flex-col space-y-8 w-full max-w-7xl mx-auto">
            <div className="w-full space-y-4">
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold">
                        Welcome to Comend, {session?.user.name?.split(" ")[0]}!
                    </h1>
                    <p>
                        {`We're happy to have you! We have a few questions to better understand how we can help you.
                        All questions in this form are optional unless marked as (required).`}
                    </p>
                    <p>
                        {`Anything you add here is editable after you've completed onboarding.`}
                    </p>
                    <p className="font-semibold">
                        {`You choose what information is shared publicly, and we will never share your data externally without your consent.`}
                    </p>
                </div>

                <Separator/>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Left side: Form */}
                <div className="col-span-1 space-y-6">
                    <h1 className="text-xl font-semibold">
                        {`We'll ask you questions here.`}
                    </h1>
                    <div className="flex flex-col space-y-4">
                        {/* Form header */}
                        <Skeleton className="h-6 w-1/3"/>
                        {/* Form inputs */}
                        <Skeleton className="h-10 w-full rounded-md"/>
                        <Skeleton className="h-10 w-full rounded-md"/>
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-10 w-2/3 rounded-md" />
                        {/* Button */}
                        <Skeleton className="h-10 w-1/4 rounded-md" />
                    </div>
                    <Button
                        variant="default"
                        onClick={() => router.push("/onboarding/user")}
                    >
                        {`Let's get started!`}
                    </Button>
                </div>

                {/* Right side: Platform preview */}
                <div className="col-span-1 space-y-6">
                    <h1 className="text-xl font-semibold">
                        {`We'll show you how your information will be used here.`}
                    </h1>
                    <div className="space-y-4">
                        {/* Image preview */}
                        <Skeleton className="h-[150px] w-full rounded-xl" />
                        {/* Information section */}
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        {/* Additional example data */}
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
