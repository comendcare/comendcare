"use client"

import OrganizationOnboardingForm from "@/components/organization-onboarding-form";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useEffect} from "react";


export default function OrganizationOnboardingPage() {
    const {data: session, status} = useSession(); // Get both session and status
    const router = useRouter();

    useEffect(() => {
        if (!session && status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, session, router])

    return (
        <main className="w-full max-w-7xl mx-auto">
            <OrganizationOnboardingForm/>
        </main>
    )
}