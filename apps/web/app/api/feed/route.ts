import { NextRequest, NextResponse } from "next/server";
import { fetchFeedPage } from "@comend/lib/fetchers";
import {getSession} from "@comend/lib/auth"
import prisma from "@comend/lib/prisma"

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
    const session = await getSession()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || `${PAGE_SIZE}`, 10), 50);
    const orgId = searchParams.get("orgId") || undefined;
    const createdAt = searchParams.get("cursorCreatedAt");
    const id = searchParams.get("cursorId");

    if (orgId) {
        const member = await prisma.member.findFirst({
            where: { userId: session.user.id, organizationId: orgId },
            select: { id: true },
        });
        if (!member) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
    }

    const cursor = createdAt && id ? { createdAt: new Date(createdAt), id } : null;


    const page = await fetchFeedPage({ orgId, cursor, limit });


    return NextResponse.json({
        items: page.items.map((i) => ({
            ...i,
            createdAt: i.createdAt.toISOString(),
        })),
        nextCursor: page.nextCursor
            ? { createdAt: page.nextCursor.createdAt.toISOString(), id: page.nextCursor.id }
            : null,
    });
}
