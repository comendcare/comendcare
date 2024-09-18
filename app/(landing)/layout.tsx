import {Metadata} from "next"
import {LandingNavbar} from "@/components/layout/sections/landing-navbar";

export const metadata: Metadata = {
    title: "RareSearch",
    description: "Check out some examples app built using the components.",
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
