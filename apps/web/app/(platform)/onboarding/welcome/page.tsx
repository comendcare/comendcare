"use client";

import { Separator } from "@comend/components/ui/separator";
import { Button } from "@comend/components/ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "./../../../../../../loading";

export default function OnboardingWelcomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // useEffect(() => {
    //     mixpanelTrack("Onboarding Started")
    // }, [])

    if (status === "loading") {
        return <Loading />;
    }

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
                <div className="col-span-1 space-y-6">
                    <Button
                        variant="default"
                        onClick={() => router.push("/onboarding/user")}
                    >
                        {`Let's get started!`}
                    </Button>
                </div>

            </div>
        </main>
    );
}
