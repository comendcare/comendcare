// app/switch-org/[orgId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@comend/lib/auth";
import prisma from "@comend/lib/prisma";
import { revalidatePath } from "next/cache";

// If you want to whitelist allowed paths, do it here
const DEFAULT_NEXT = "/app/profile";
const PATHS_TO_REVALIDATE: string[] = []; // or your existing PATHS

export async function GET(
    req: Request,
    { params }: { params: { orgId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const orgId = params.orgId;
    // Allow caller to pass ?next=/somewhere (optional)
    const url = new URL(req.url);
    const next = url.searchParams.get("next") || DEFAULT_NEXT;

    // Verify membership
    const membership = await prisma.member.findFirst({
        where: { userId: session.user.id, organizationId: orgId },
        select: { id: true },
    });
    if (!membership) {
        // If not authorized, send them somewhere safe
        return NextResponse.redirect(new URL(DEFAULT_NEXT, req.url));
    }

    // Update active org
    await prisma.user.update({
        where: { id: session.user.id },
        data: { activeOrganizationId: orgId },
    });

    // Revalidate any org-dependent pages if needed
    for (const p of PATHS_TO_REVALIDATE) revalidatePath(p);

    // Hard redirect: old page is gone, no layout re-run can override this
    return NextResponse.redirect(new URL(next, req.url));
}
