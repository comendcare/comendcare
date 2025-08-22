import crypto from "node:crypto";
import { register } from "~web/app/(platform)/app/feed/registry";

type RssItem = {
    guid?: string;
    link?: string;
    title?: string;
    summary?: string;
    description?: string;
    pubDate?: string;
    categories?: string[];
};

type FdaFeedType =
    | "FDA_MEDWATCH_ALERT"
    | "FDA_WHATS_NEW_DRUGS"
    | "FDA_WHATS_NEW_VBB"
    | "FDA_PRESS_RELEASE";

function makeFdaRssMapper(provider: string, type: FdaFeedType) {
    register(provider, "rss_item", async ({ payload, occurredAt }) => {
        const item = payload as RssItem;
        if (!item?.title || !item?.link) return null;

        const idKey = item.guid ?? item.link;
        const idempotencyKey = crypto.createHash("sha256").update(`fda:${type}:${idKey}`).digest("hex");

        return {
            type,
            source: "THIRD_PARTY",
            title: item.title,
            content: {
                guid: item.guid ?? "",
                summary: item.summary ?? item.description ?? "",
                categories: item.categories ?? [],
            },
            externalUrl: item.link,
            occurredAt: occurredAt ?? (item.pubDate ? new Date(item.pubDate) : new Date()),
            idempotencyKey,
        };
    });
}

makeFdaRssMapper("rss:fda:medwatch", "FDA_MEDWATCH_ALERT");
makeFdaRssMapper("rss:fda:whats-new-drugs", "FDA_WHATS_NEW_DRUGS");
makeFdaRssMapper("rss:fda:whats-new-vbb", "FDA_WHATS_NEW_VBB");
makeFdaRssMapper("rss:fda:press", "FDA_PRESS_RELEASE");
