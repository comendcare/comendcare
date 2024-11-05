import {Metadata} from "next";
import {ReactNode} from "react";
import Steps, {Step} from "@/components/steps";
import {getSession} from "@/lib/auth";
import {redirect} from "next/navigation";

export const metadata: Metadata = {
    title: "Onboarding | Comend",
};

const steps: Step[] = [
    {
        name: 'About you',
        description: 'Your profile information.',
        href: '/onboarding/user',
        status: 'complete'
    },
    {
        name: 'Organization',
        description: 'Basic information about your organization.',
        href: '/onboarding/organization',
        status: 'complete'
    },
    {
        name: 'Finances',
        description: 'Your budget and raising efforts.',
        href: '/onboarding/finances',
        status: 'current'
    },
    {
        name: 'Research',
        description: 'The current research efforts in your disorder.',
        href: '/onboarding/research',
        status: 'upcoming'
    },
]

export default async function AuthLayout({children}: { children: ReactNode }) {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }

    return (
        <div className="flex flex-row mx-auto w-full min-h-screen justify-center py-12 sm:px-6 lg:px-8">
            <Steps steps={steps}/>
            {children}
        </div>
    );
}
