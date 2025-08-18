// lib/raw-events.ts
import crypto from "node:crypto";
import prisma from "@comend/lib/prisma"

export async function writeRawEvent(input: {
    provider: string;        // "app" | "mixpanel" | "rss:fda:medwatch" | "ctgov"
    eventType: string;       // "rfp_created" | "rss_item" | "trial_posted"
    externalId?: string;     // guid, NCTId, mixpanel distinct or event id
    occurredAt?: Date;
    payload: unknown;
}) {
    const { provider, eventType, externalId, occurredAt, payload } = input as any;
    const dedupeKey = crypto
        .createHash("sha256")
        .update(`${provider}:${eventType}:${externalId ?? JSON.stringify(payload)}`)
        .digest("hex");

    return prisma.rawIngestEvent.upsert({
        where: { dedupeKey },
        update: { payload, occurredAt: occurredAt ?? new Date(), status: "PENDING", error: null },
        create: {
            provider,
            eventType,
            externalId,
            occurredAt: occurredAt ?? new Date(),
            payload,
            dedupeKey,
        },
    });
}
