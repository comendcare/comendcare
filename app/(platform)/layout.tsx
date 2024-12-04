import {getSession} from "@/lib/auth";
import {redirect} from "next/navigation";

interface PlatformLayoutProps {
    children: React.ReactNode
}

export default async function PlatformLayout({children}: PlatformLayoutProps) {
    const session = await getSession()

    // Determine if the user is an admin
    const isWhitelisted = session?.user?.email?.endsWith("@comendcare.com") ||
        (process.env.USER_WHITELIST?.split(",").includes(session?.user?.email || ""));

    // Redirect if the user is not signed in or not an admin, with a query parameter
    if (!session) {
        redirect("/");
    } else if (!isWhitelisted) {
        redirect("/");
    }

    return (
        <>
            {children}
        </>
    )
}
