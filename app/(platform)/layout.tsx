import {getSession} from "@/lib/auth";
import {redirect} from "next/navigation";
import prisma from "@/lib/prisma";

interface PlatformLayoutProps {
    children: React.ReactNode
}

export default async function PlatformLayout({children}: PlatformLayoutProps) {
    const session = await getSession()

    const whitelist = await prisma.whitelist.findMany({
        select: { email: true },
    });

    const email = session?.user?.email?.toLowerCase();

    // Env variable whitelisting
    // const isWhitelisted =
    //     email?.endsWith("@comendcare.com") ||
    //     process.env.USER_WHITELIST?.split(",").some((whitelistedEmail) => whitelistedEmail.toLowerCase() === email);

    // Database whitelisting
    const isWhitelisted = whitelist.some(
        (entry) => entry.email.toLowerCase() === email
    ) || email?.endsWith("@comendcare.com");

    if (!session) {
        redirect("/");
    } else if (!isWhitelisted) {
        redirect("/signed-out?reason=not_whitelisted");
    } else if (session.terminate) {
        redirect("/signed-out?reason=terminated");
    } else if (session.roleChanged) {
        redirect("/signed-out?reason=roleChanged");
    }

    return (
        <>
            {children}
        </>
    )
}
