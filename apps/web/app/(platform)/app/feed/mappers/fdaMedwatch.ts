// feed/mappers/fdaMedwatch.ts
import crypto from "node:crypto";
import { register } from "../registry";

register("rss:fda:medwatch", "rss_item", async ({ payload, occurredAt }) => {
    const item = payload as {
        guid?: string;
        link?: string;
        title?: string;
        summary?: string;
        pubDate?: string;
    };
    if (!item?.title || !item?.link) return null;

    const idKey = item.guid ?? item.link;
    const idempotencyKey = crypto.createHash("sha256").update(`fda:medwatch:${idKey}`).digest("hex");

    return {
        type: "FDA_MEDWATCH_ALERT",
        source: "THIRD_PARTY",
        title: item.title,
        content: { guid: item.guid ?? "", summary: item.summary ?? "" },
        externalUrl: item.link,
        occurredAt: occurredAt ?? new Date(item.pubDate ?? Date.now()),
        idempotencyKey,
    };
});
