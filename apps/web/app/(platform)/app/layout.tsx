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

    const [memberships, invitations, user, memberRequests] = await Promise.all([
        prisma.member.findMany({
            where: { userId },
            include: {
                organization: true,
                user: true,
                invitedBy: true,
            },
            orderBy: { createdAt: "asc" },
        }),
        prisma.invitation.findMany({
            where: { email: session!.user!.email!, accepted: false },
            select: { id: true, role: true, organizationId: true, organization: true },
            orderBy: { createdAt: "asc" },
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                emailHash: true,
                createdAt: true,
                updatedAt: true,
                metadata: true,
                name: true,
                nameHash: true,
                username: true,
                emailVerified: true,
                image: true,
                notificationSettings: true,
                consentSettings: true,
            },
        }),
        prisma.memberRequest.findMany({
            where: { userId, approved: true },
            include: { user: true, organization: true },
            orderBy: { createdAt: "desc" },
        }),
    ]);

    // If not logged in, render a loading or redirect logic as you already do.
    if (!user) return <div/>;

    if (memberships.length === 0) {
        return (
            <InvitationGate invitations={invitations}>
                <div className="min-h-screen h-full flex flex-col items-center">
                    <header
                        className="px-4 bg-white sticky top-0 flex justify-end h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-b bg-background w-full z-50 overflow-hidden"
                    >
                        <NavUser
                            user={user}
                            memberRequests={memberRequests}
                        />
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
            <AppClientShell
                user={user}
                memberships={memberships}
                memberRequests={memberRequests}
            >
                {children}
            </AppClientShell>
        </InvitationGate>
    );
}
