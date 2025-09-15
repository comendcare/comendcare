// app/api/ingest/process/route.ts
import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";
import {getMapper} from "~web/app/(platform)/app/notifications/registry";
import {CanonicalFeed, GLOBAL_FEED_TYPES} from "@comend/lib/types";
import "~web/app/(platform)/app/notifications/mappers"


export const dynamic = "force-dynamic";
export const runtime = "nodejs";


// Share the core logic so GET can call it too
async function processBatch() {
    const batch = await prisma.rawIngestEvent.findMany({
        where: { status: "PENDING" },
        orderBy: { receivedAt: "asc" },
        take: 100,
    });

    for (const raw of batch) {
        try {
            const mapper = getMapper(raw.provider, raw.eventType);
            if (!mapper) {
                await prisma.rawIngestEvent.update({
                    where: { id: raw.id },
                    data: { status: "SKIPPED", error: "No mapper" },
                });
                continue;
            }

            const result = await mapper({
                provider: raw.provider,
                eventType: raw.eventType,
                occurredAt: raw.occurredAt,
                payload: raw.payload,
            });

            const canonicals = Array.isArray(result) ? result : (result ? [result] : []);

            if (canonicals.length === 0) {
                await prisma.rawIngestEvent.update({
                    where: { id: raw.id }, data: { status: "SKIPPED", error: "Mapper returned null" },
                });
                continue;
            }

            for (const canonical of canonicals) {
                const feed = CanonicalFeed.parse(canonical);

                const isGlobalType = GLOBAL_FEED_TYPES.includes(feed.type as any);
                if (isGlobalType && feed.orgId) throw new Error(`Global feed type ${feed.type} must not have orgId`);
                if (!isGlobalType && !feed.orgId) throw new Error(`Org-scoped feed type ${feed.type} requires orgId`);

                await prisma.feedItem.upsert({
                    where: { idempotencyKey: feed.idempotencyKey },
                    update: {
                        title: feed.title,
                        content: feed.content as any,
                        externalUrl: feed.externalUrl,
                        orgId: feed.orgId,
                        userId: feed.userId,
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
                        occurredAt: feed.occurredAt,
                        rawEventId: raw.id,
                    },
                });
            }

            await prisma.rawIngestEvent.update({ where: { id: raw.id }, data: { status: "PROCESSED" } });
        } catch (err: any) {
            await prisma.rawIngestEvent.update({
                where: { id: raw.id }, data: { status: "FAILED", error: String(err?.message ?? err) },
            });
        }
    }

    return batch.length;
}

export async function POST(req: Request) {
    const processed = await processBatch();
    return NextResponse.json({ processed });
}

export async function GET(req: Request) {
    const processed = await processBatch();
    return NextResponse.json({ processed, note: "Invoked via GET" });
}
