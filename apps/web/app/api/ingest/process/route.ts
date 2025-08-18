// app/api/ingest/process/route.ts
import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";
import {getMapper} from "~web/app/(platform)/app/feed/registry";
import { CanonicalFeed } from "@comend/lib/types";

export const dynamic = "force-dynamic";

export async function POST() {
    // Pull a small batch of PENDING events
    const batch = await prisma.rawIngestEvent.findMany({
        where: { status: "PENDING" },
        orderBy: { receivedAt: "asc" },
        take: 100,
    });

    for (const raw of batch) {
        try {
            const mapper = getMapper(raw.provider, raw.eventType);
            if (!mapper) {
                await prisma.rawIngestEvent.update({ where: { id: raw.id }, data: { status: "SKIPPED", error: "No mapper" } });
                continue;
            }

            const canonical = await mapper({
                provider: raw.provider,
                eventType: raw.eventType,
                occurredAt: raw.occurredAt,
                payload: raw.payload,
            });
            if (!canonical) {
                await prisma.rawIngestEvent.update({ where: { id: raw.id }, data: { status: "SKIPPED", error: "Mapper returned null" } });
                continue;
            }

            // Validate (extra safety)
            const feed = CanonicalFeed.parse(canonical);

            // Upsert FeedItem by idempotencyKey
            const item = await prisma.feedItem.upsert({
                where: { idempotencyKey: feed.idempotencyKey },
                update: {
                    title: feed.title,
                    content: feed.content as any,
                    externalUrl: feed.externalUrl,
                    orgId: feed.orgId,
                    userId: feed.userId,
                    // DO NOT change createdAt on update (preserve original)
                },
                create: {
                    idempotencyKey: feed.idempotencyKey,
                    type: feed.type as any,
                    source: feed.source as any,
                    title: feed.title,
                    content: feed.content as any,
                    externalUrl: feed.externalUrl,
                    orgId: feed.orgId,
                    userId: feed.userId,
                    createdAt: feed.occurredAt,  // key detail for “timeline as-it-happened”
                    rawEventId: raw.id,
                },
            });

            await prisma.rawIngestEvent.update({ where: { id: raw.id }, data: { status: "PROCESSED" } });
        } catch (err: any) {
            await prisma.rawIngestEvent.update({ where: { id: raw.id }, data: { status: "FAILED", error: String(err?.message ?? err) } });
        }
    }

    return NextResponse.json({ processed: batch.length });
}
