import {LandingNavbar} from "@/components/layout/sections/landing-navbar";
import LandingFooter from "@/components/layout/sections/landing-footer";

interface AppLayoutProps {
    children: React.ReactNode
}

export default function LandingLayout({children}: AppLayoutProps) {

    return (
        <>
            <LandingNavbar/>
            <main>
                {children}
                <LandingFooter/>
            </main>
        </>
    )
}
