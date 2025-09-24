// app/app/layout.tsx  (Server Component)
import {getServerSession} from "next-auth";
import {authOptions} from "@/packages/lib/auth";
import prisma from "@/packages/lib/prisma";
import AppClientShell from "./_client-shell";
import InvitationGate from "~web/components/invitation-gate";
import {Organization} from "@prisma/client";
import {Button} from "@/packages/components/ui/button";
import Link from "next/link";
import {SidebarTrigger} from "@/packages/components/ui/sidebar";
import {NavUser} from "~web/components/nav-user";
import * as React from "react";

export default async function AppLayoutServer({children}: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // If not logged in, render a loading or redirect logic as you already do.
    if (!userId) return <div/>;

    const memberships = await prisma.member.findMany({
        where: {userId},
        include: {organization: true},
        orderBy: {createdAt: "asc"},
    });

    // Fetch pending invitations server-side
    let invitations: Array<{
        id: string;
        role: string;
        organizationId: string;
        organization: Organization;
    }> = [];

    if (userId) {
        invitations = await prisma.invitation.findMany({
            where: {email: session!.user!.email!, accepted: false},
            select: {id: true, role: true, organizationId: true, organization: true},
            orderBy: {createdAt: "asc"},
        });
    }

    if (memberships.length === 0) {
        return (
            <InvitationGate invitations={invitations}>
                <div className="min-h-screen h-full flex flex-col items-center">
                    <header
                        className="px-4 bg-white sticky top-0 flex justify-end h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-b bg-background w-full z-50 overflow-hidden"
                    >
                        <NavUser/>
                    </header>
                    <main className="flex flex-col items-start justify-center h-[calc(100vh-3.5rem)] mx-auto max-w-md text-left space-y-4">
                        <h1 className="text-xl font-semibold">Welcome to Comend!</h1>

                        <p>
                            {`You're not a member of any organizations yet. Please contact your organization's owner to request an invitation. Otherwise, create a new organization.`}
                        </p>

                        <Link href="/create/new-organization" className="inline-block">
                            <Button variant="cta">Create an organization</Button>
                        </Link>
                    </main>
                </div>
            </InvitationGate>
        )
    }

    return (
        <InvitationGate invitations={invitations}>
            <AppClientShell memberships={memberships}>
                {children}
            </AppClientShell>
        </InvitationGate>
    );
}
