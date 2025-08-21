import {redirect} from "next/navigation";
import {getSession} from "@/packages/lib/auth";

interface AppLayoutProps {
    children: React.ReactNode
}

export default async function LandingLayout({children}: AppLayoutProps) {
    const session = await getSession()

    if (session) {
        redirect("/app/dashboard")
    }

    return (
        <>
            {children}
        </>
    )
}
