// app/app/layout.tsx  (Server Component)
import {getServerSession} from "next-auth";
import {authOptions} from "@/packages/lib/auth";
import prisma from "@/packages/lib/prisma";
import AppClientShell from "./_client-shell";
import InvitationGate from "~web/components/invitation-gate";
import {Organization} from "@prisma/client";

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

    return (
        <InvitationGate invitations={invitations}>
            <AppClientShell memberships={memberships}>
                {children}
            </AppClientShell>
        </InvitationGate>
    );
}
