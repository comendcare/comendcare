import { LandingNavbar } from "~web/components/landing/landing-navbar"
import LandingFooter from "~web/components/landing/landing-footer"

interface AppLayoutProps {
    children: React.ReactNode
}

export default function LandingLayout({ children }: AppLayoutProps) {
    return (
        <>
            <LandingNavbar />
            <main>
                {children}
                <LandingFooter />
            </main>
        </>
    )
}
