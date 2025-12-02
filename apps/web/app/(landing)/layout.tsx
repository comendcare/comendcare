import {LandingNavbar} from "~web/components/landing/landing-navbar"
import LandingFooter from "~web/components/landing/landing-footer"
import {SigninDropdownProvider} from "@/state/signin/signin-drodown-context";

interface AppLayoutProps {
    children: React.ReactNode
}

export default function LandingLayout({children}: AppLayoutProps) {
    return (
        <>
            <SigninDropdownProvider>
                <LandingNavbar/>
                <main>
                    {children}
                    <LandingFooter/>
                </main>
            </SigninDropdownProvider>
        </>
    )
}
