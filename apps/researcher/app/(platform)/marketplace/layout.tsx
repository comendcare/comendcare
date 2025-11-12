import {ReactNode} from "react";
import { MarketplaceNav } from "~researcher/components/marketplace/marketplace-nav";
import {ResearcherNavbar} from "~researcher/components/researcher-navbar";
import prisma from "@/packages/lib/prisma";
import * as React from "react";
import { getSession } from "~researcher/lib/auth";

export default async function ResearcherLayout({children}: { children: ReactNode }) {
    const session = await getSession()
    const userId = session?.user?.id;
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
        <div>
            <ResearcherNavbar user={user}/>
            <div className="min-h-screen container relative flex flex-col gap-4 items-center mx-auto pt-4">
                <MarketplaceNav />
                {children}
            </div>
        </div>
    );
}
