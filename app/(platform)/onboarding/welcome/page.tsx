"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/app/loading";
import { useEffect } from "react";
import mixpanel from "mixpanel-browser";

export default function OnboardingWelcomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return <Loading />;
    }

    useEffect(() => {
        mixpanel.track("Onboarding Started")
    }, [])

    return (
        <main className="flex flex-col space-y-8 w-full max-w-7xl mx-auto">
            <div className="w-full space-y-4">
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold">
                        Welcome to Comend{session?.user.name ? `, ${session.user.name.split(" ")[0]}!` : "!"}
                    </h1>
                    <p>
                        {`To create your profile and help us understand how we can best support you, we have some questions.`}
                    </p>
                    <p>
                        {`This should take ~5 minutes if you're creating an organization for the first time.`}
                    </p>
                    <p className="font-semibold">
                        {`You will have detailed control over your data privacy once you finish signing up.`}
                    </p>
                </div>

                <Separator />
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Left side: Form */}
                <div className="col-span-1 space-y-6">
                    {/*<h1 className="text-xl font-semibold">*/}
                    {/*    {`We'll ask you questions here.`}*/}
                    {/*</h1>*/}
                    {/*<div className="flex flex-col space-y-4">*/}
                    {/*    /!* Form header *!/*/}
                    {/*    <div className="h-6 w-1/3 border-dashed border-2 border-gray-400 rounded"></div>*/}
                    {/*    /!* Form inputs *!/*/}
                    {/*    <div className="h-10 w-full border-dashed border-2 border-gray-400 rounded-md"></div>*/}
                    {/*    <div className="h-10 w-full border-dashed border-2 border-gray-400 rounded-md"></div>*/}
                    {/*    <div className="h-10 w-full border-dashed border-2 border-gray-400 rounded-md"></div>*/}
                    {/*    <div className="h-10 w-full border-dashed border-2 border-gray-400 rounded-md"></div>*/}
                    {/*    <div className="h-10 w-2/3 border-dashed border-2 border-gray-400 rounded-md"></div>*/}
                    {/*    /!* Button *!/*/}
                    {/*    <div className="h-10 w-1/4 border-dashed border-2 border-gray-400 rounded-md"></div>*/}
                    {/*</div>*/}
                    <Button
                        variant="default"
                        onClick={() => router.push("/onboarding/user")}
                    >
                        {`Let's get started!`}
                    </Button>
                </div>

            {/*     Right side: Platform preview */}
            {/*    <div className="col-span-1 space-y-6">*/}
            {/*        <h1 className="text-xl font-semibold">*/}
            {/*            {`We'll show you how your information will be used here.`}*/}
            {/*        </h1>*/}
            {/*        <div className="space-y-4">*/}
            {/*            /!* Image preview *!/*/}
            {/*            <div className="h-[150px] w-full border-dashed border-2 border-gray-400 rounded-xl"></div>*/}
            {/*            /!* Information section *!/*/}
            {/*            <div className="space-y-2">*/}
            {/*                <div className="h-6 w-1/2 border-dashed border-2 border-gray-400 rounded"></div>*/}
            {/*                <div className="h-4 w-3/4 border-dashed border-2 border-gray-400 rounded"></div>*/}
            {/*                <div className="h-4 w-1/2 border-dashed border-2 border-gray-400 rounded"></div>*/}
            {/*            </div>*/}
            {/*            /!* Additional example data *!/*/}
            {/*            <div className="space-y-2">*/}
            {/*                <div className="h-6 w-2/3 border-dashed border-2 border-gray-400 rounded"></div>*/}
            {/*                <div className="h-4 w-full border-dashed border-2 border-gray-400 rounded"></div>*/}
            {/*                <div className="h-4 w-3/4 border-dashed border-2 border-gray-400 rounded"></div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            </div>
        </main>
    );
}
