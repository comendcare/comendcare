import {getSession} from "@/packages/lib/auth";
import { unstable_noStore as noStore } from "next/cache";
import {redirect} from "next/navigation";
import prisma from "@comend/lib/prisma";

interface PlatformLayoutProps {
    children: React.ReactNode
}

export default async function PlatformLayout({children}: PlatformLayoutProps) {
    noStore();

    const session = await getSession()
    if (!session) redirect("/login");

    const rawEmail = session.user?.email;
    if (!rawEmail) redirect("/signed-out?reason=no_email");

    const email = rawEmail.toLowerCase();
    const isCompanyEmail = email.endsWith("@comendcare.com");

    // Targeted, parallel lookups (fast & index-friendly)
    const [whitelistHit, blacklistHit] = await Promise.all([
        prisma.whitelist.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
            select: { email: true },
        }),
        prisma.blacklist.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
            select: { email: true },
        }),
    ]);

    const isWhitelisted = Boolean(whitelistHit) || isCompanyEmail;
    const isBlacklisted = Boolean(blacklistHit);

    // Precedence: blacklist > whitelist
    if (isBlacklisted) redirect("/signed-out?reason=blacklisted");
    if (!isWhitelisted) redirect("/signed-out?reason=not_whitelisted");

    // Custom flags on the session (type these on your Session object)
    if ((session as any).terminate) redirect("/signed-out?reason=terminated");
    if ((session as any).roleChanged) redirect("/signed-out?reason=roleChanged");

    return (
        <>
            {children}
        </>
    )
}
