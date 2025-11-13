import {Metadata} from "next";
import {ReactNode} from "react";

export const metadata: Metadata = {
    title: "Onboarding | Comend",
};

export default async function ResearcherOnboardingLayout({children}: { children: ReactNode }) {

    return (
        <div className="flex flex-row mx-auto w-full min-h-screen justify-center py-12 px-6 lg:px-8 gap-x-4">
            {children}
        </div>
    );
}
