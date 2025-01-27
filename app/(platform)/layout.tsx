import {getSession} from "@/lib/auth";
import {redirect} from "next/navigation";

interface PlatformLayoutProps {
    children: React.ReactNode
}

export default async function PlatformLayout({children}: PlatformLayoutProps) {
    const session = await getSession()

    const email = session?.user?.email?.toLowerCase();
    const isWhitelisted =
        email?.endsWith("@comendcare.com") ||
        process.env.USER_WHITELIST?.split(",").some((whitelistedEmail) => whitelistedEmail.toLowerCase() === email);

    if (!session) {
        redirect("/");
    } else if (!isWhitelisted) {
        redirect("/signed-out");
    } else if (session.terminate) {
        redirect("/signed-out")
    }

    return (
        <>
            {children}
        </>
    )
}
