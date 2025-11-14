import {getSession} from "~researcher/lib/auth";
import {redirect} from "next/navigation";
import {ResearcherNavbar} from "~researcher/components/researcher-navbar";
import {getServerSession} from "next-auth";
import {authOptions} from "@/packages/lib/auth";
import prisma from "@/packages/lib/prisma";
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
