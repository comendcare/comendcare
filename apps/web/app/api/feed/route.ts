import { NextRequest, NextResponse } from "next/server";
import { fetchFeedPage } from "@comend/lib/fetchers";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || `${PAGE_SIZE}`, 10), 50);
    const orgId = searchParams.get("orgId") || undefined;
    const createdAt = searchParams.get("cursorCreatedAt");
    const id = searchParams.get("cursorId");


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
