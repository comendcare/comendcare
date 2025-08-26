import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";
import { fetchRss, occurredAtFrom } from "~web/lib/fda-rss";
import { FDA_FEEDS } from "~web/lib/fda-feeds";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

export async function GET() {
    const results: Record<
        string,
        { fetched: number; enqueued: number; skipped: number; errors: number }
    > = {};
    const now = new Date();

    for (const feed of FDA_FEEDS) {
        results[feed.provider] = { fetched: 0, enqueued: 0, skipped: 0, errors: 0 };

        try {
            const { items } = await fetchRss(feed.url);
            results[feed.provider].fetched = items.length;

            for (const item of items) {
                // sanity check
                if (!item?.title || !item?.link) {
                    results[feed.provider].skipped++;
                    continue;
                }

                // stable external identifier for deduping (prefer guid, then link, then title)
                const externalId = item.guid ?? item.link ?? item.title;

                const dedupeKey = crypto
                    .createHash("sha256")
                    .update(`${feed.provider}:rss_item:${externalId}`)
                    .digest("hex");

                try {
                    await prisma.rawIngestEvent.upsert({
                        where: { dedupeKey }, // <— requires a unique index on RawIngestEvent.dedupeKey
                        update: {
                            // Optionally refresh payload if the item content changes upstream
                            payload: item as any,
                        },
                        create: {
                            dedupeKey,
                            provider: feed.provider,
                            eventType: "rss_item",
                            occurredAt: occurredAtFrom(item),
                            receivedAt: now,
                            payload: item as any,
                            status: "PENDING",
                        },
                    });

                    results[feed.provider].enqueued++;
                } catch {
                    results[feed.provider].errors++;
                    console.log("Error extracting RSS item:", results[feed.provider].errors++);
                }
            }
        } catch {
            results[feed.provider].errors++;
            console.log("Error fetching RSS feed:", results[feed.provider].errors++);
        } finally {
            await prisma.$disconnect()
        }
    }

    return NextResponse.json({ results });
}

export async function POST() {
    return GET();
}
