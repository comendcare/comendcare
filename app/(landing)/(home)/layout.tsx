import {redirect} from "next/navigation";
import {getSession} from "@/lib/auth";

interface AppLayoutProps {
    children: React.ReactNode
}

export default async function LandingLayout({children}: AppLayoutProps) {
    const session = await getSession()

    if (session) {
        redirect("/app/marketplace/cro")
    }

    return (
        <>
            {children}
        </>
    )
}
