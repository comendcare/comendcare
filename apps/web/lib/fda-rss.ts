import crypto from "node:crypto";
import Parser from "rss-parser";

export type RssItem = {
    guid?: string;
    link?: string;
    title?: string;
    description?: string;
    summary?: string;        // some libs map description -> summary
    pubDate?: string;
    categories?: string[];   // may exist
    creator?: string;        // dc:creator can map here depending on parser setup
};

const parser = new Parser({
    // Parser is liberal; these custom fields catch dc:creator if available.
    customFields: {
        item: [
            ["dc:creator", "creator"],
            ["description", "description"],
        ],
    },
});

export async function fetchRss(url: string) {
    const feed = await parser.parseURL(url);
    return {
        title: feed.title ?? "",
        items: (feed.items ?? []) as unknown as RssItem[],
    };
}

/** Deterministic idempotency key for a raw event (per item + provider) */
export function rawEventKey(provider: string, item: RssItem) {
    const idKey = item.guid ?? item.link ?? item.title ?? "";
    return crypto.createHash("sha256").update(`${provider}:${idKey}`).digest("hex");
}

/** Best-effort occurredAt (prefer RSS pubDate if present) */
export function occurredAtFrom(item: RssItem) {
    return item.pubDate ? new Date(item.pubDate) : new Date();
}
