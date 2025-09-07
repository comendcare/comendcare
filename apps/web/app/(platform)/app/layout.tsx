// app/app/layout.tsx  (Server Component)
import { getServerSession } from "next-auth";
import { authOptions } from "@/packages/lib/auth";
import prisma from "@/packages/lib/prisma";
import AppClientShell from "./_client-shell";

export default async function AppLayoutServer({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // If not logged in, render a loading or redirect logic as you already do.
    if (!userId) return <div />;

    const memberships = await prisma.member.findMany({
        where: { userId },
        include: { organization: true },
        orderBy: { createdAt: "asc" },
    });

    return (
        <AppClientShell memberships={memberships}>
            {children}
        </AppClientShell>
    );
}
