import {Metadata} from "next"
import {LandingNavbar} from "@/components/layout/sections/landing-navbar";

export const metadata: Metadata = {
    title: "Comend",
    description: "The platform for patient-led rare disease research",
}

interface AppLayoutProps {
    children: React.ReactNode
}

export default function LandingLayout({children}: AppLayoutProps) {

    return (
        <>
            <LandingNavbar/>
            <main>
                {children}
            </main>
        </>
    )
}
