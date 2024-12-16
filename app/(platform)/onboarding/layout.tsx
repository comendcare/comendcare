import {Metadata} from "next";
import {ReactNode} from "react";
import OnboardingSteps, {Step} from "@/components/onboarding-steps";
import {getSession} from "@/lib/auth";
import {redirect} from "next/navigation";

export const metadata: Metadata = {
    title: "Onboarding | Comend",
};

export default async function AuthLayout({children}: { children: ReactNode }) {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    // Redirect if user is already a part of an org (either that they have created or that they have been invited to)
    if (session.user.organizationId) {
        redirect("/app/profile")
    }

    return (
        <div className="flex flex-row mx-auto w-full min-h-screen justify-center py-12 sm:px-6 lg:px-8 gap-x-4">
            <OnboardingSteps/>
            {children}
        </div>
    );
}
