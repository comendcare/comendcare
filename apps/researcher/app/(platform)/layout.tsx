import {getSession} from "~researcher/lib/auth";
import {redirect} from "next/navigation";
import {ResearcherNavbar} from "~researcher/components/researcher-navbar";
import {getServerSession} from "next-auth";
import prisma from "@comend/lib/prisma";
import * as React from "react";

interface PlatformLayoutProps {
    children: React.ReactNode
}

export default async function PlatformLayout({children}: PlatformLayoutProps) {
    const session = await getSession()
    const userId = session?.user?.id;

    if (!session) {
        redirect("/?error=unauthenticated");
    } else if (session.terminate) {
        redirect("/signed-out?reason=terminated");
    } else if (session.roleChanged) {
        redirect("/signed-out?reason=roleChanged");
    }

    const rawEmail = session.user?.email;
    if (!rawEmail) redirect("/signed-out?reason=no_email");

    const email = rawEmail.toLowerCase();
    const isCompanyEmail = email.endsWith("@comendcare.com");

    // Targeted, parallel lookups (fast & index-friendly)
    const [blacklistHit] = await Promise.all([
        prisma.blacklist.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
            select: { email: true },
        }),
    ]);

    const isBlacklisted = Boolean(blacklistHit);

    if (isBlacklisted) redirect("/signed-out?reason=blacklisted");

    // Custom flags on the session (type these on your Session object)
    if ((session as any).terminate) redirect("/signed-out?reason=terminated");
    if ((session as any).roleChanged) redirect("/signed-out?reason=roleChanged");

    const [user] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
            },
        }),
    ]);

    // If not logged in, render a loading or redirect logic as you already do.
    if (!user) return <div/>;

    return (
        <>
            <ResearcherNavbar user={user}/>
            {children}
        </>
    )
}
