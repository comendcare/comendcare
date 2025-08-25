import crypto from "node:crypto";
import prisma from "@comend/lib/prisma";
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

// Canonical shape (narrow, compatible with your CanonicalFeed)
type CanonicalBase = {
    type: FdaFeedType;
    source: "THIRD_PARTY";
    title: string;
    content?: Record<string, any>;
    externalUrl?: string;
    orgId?: string;
    userId?: string;
    occurredAt: Date;
    idempotencyKey: string;
};

// --- minimal helpers for RD + org targeting ---------------------------------

let RD_TERMS: string[] | null = null;
let ORG_CFGS:
    | null
    | Array<{ orgId: string; conditions: string[]; genes: string[]; therapeutics: string[] }> = null;

const norm = (s?: string) => (s ?? "").toLowerCase();
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const hit = (text: string, term: string) => new RegExp(`\\b${esc(term.toLowerCase())}\\b`, "i").test(text);

async function loadRareDiseaseTerms() {
    if (RD_TERMS) return RD_TERMS;
    const rows = await prisma.condition.findMany({
        select: { name: true, synonyms: true },
    });
    const set = new Set<string>();
    for (const r of rows) {
        if (r.name) set.add(r.name);
        for (const s of r.synonyms ?? []) if (s) set.add(s);
    }
    RD_TERMS = Array.from(set);
    return RD_TERMS;
}

async function loadOrgCfgs() {
    if (ORG_CFGS) return ORG_CFGS;
    const orgs = await prisma.organization.findMany({
        where: { published: true },
        select: {
            id: true,
            therapeuticsOfInterest: true,
            conditions: { include: { condition: { select: { name: true, synonyms: true } } } },
            tools: { include: { gene: { select: { symbol: true, aliasSymbols: true } } } },
        },
    });
    ORG_CFGS = orgs.map((o) => ({
        orgId: o.id,
        conditions: Array.from(
            new Set(
                o.conditions.flatMap((c) => [c.condition?.name, ...(c.condition?.synonyms ?? [])]).filter(Boolean) as string[],
            ),
        ),
        genes: Array.from(
            new Set(o.tools.flatMap((t) => [t.gene?.symbol, ...(t.gene?.aliasSymbols ?? [])]).filter(Boolean) as string[]),
        ),
        therapeutics: (o.therapeuticsOfInterest ?? []).filter(Boolean),
    }));
    return ORG_CFGS;
}

// -----------------------------------------------------------------------------

function makeFdaRssMapper(provider: string, type: FdaFeedType) {
    register(provider, "rss_item", async ({ payload, occurredAt }) => {
        const item = payload as RssItem;
        if (!item?.title || !item?.link) return null;

        // Build text blob once
        const text = norm([item.title, item.summary ?? item.description].filter(Boolean).join(" • "));

        // 1) rare-disease gate (global relevance)
        const rdTerms = await loadRareDiseaseTerms();
        const isRare = rdTerms.some((t) => hit(text, t));
        if (!isRare) return null; // ignore non-RD items entirely

        const idKey = item.guid ?? item.link;
        const when = occurredAt ?? (item.pubDate ? new Date(item.pubDate) : new Date());

        // 2) org targeting
        const cfgs = await loadOrgCfgs();
        const orgItems: (CanonicalBase & { orgId: string })[] = [];
        for (const cfg of cfgs) {
            const matched =
                cfg.conditions.some((t) => hit(text, t)) ||
                cfg.genes.some((t) => hit(text, t)) ||
                cfg.therapeutics.some((t) => hit(text, t));
            if (!matched) continue;

            const orgIdem = crypto
                .createHash("sha256")
                .update(`fda:${type}:${idKey}:org:${cfg.orgId}`)
                .digest("hex");

            orgItems.push({
                type,
                source: "THIRD_PARTY",
                title: item.title!,
                content: {
                    guid: item.guid ?? "",
                    summary: item.summary ?? item.description ?? "",
                    categories: item.categories ?? [],
                    matched: true,
                },
                externalUrl: item.link!,
                occurredAt: when,
                idempotencyKey: orgIdem,
                orgId: cfg.orgId,
            });
        }

        // 3) global RD item (shown to all feeds)
        const globalIdem = crypto.createHash("sha256").update(`fda:${type}:${idKey}:global`).digest("hex");
        const globalItem: CanonicalBase = {
            type,
            source: "THIRD_PARTY",
            title: item.title!,
            content: {
                guid: item.guid ?? "",
                summary: item.summary ?? item.description ?? "",
                categories: item.categories ?? [],
                rd: true,
            },
            externalUrl: item.link!,
            occurredAt: when,
            idempotencyKey: globalIdem,
            // no orgId → global
        };

        // Return fan-out: one global + zero-or-more org-scoped
        return [globalItem, ...orgItems];
    });
}

makeFdaRssMapper("rss:fda:medwatch", "FDA_MEDWATCH_ALERT");
makeFdaRssMapper("rss:fda:whats-new-drugs", "FDA_WHATS_NEW_DRUGS");
makeFdaRssMapper("rss:fda:whats-new-vbb", "FDA_WHATS_NEW_VBB");
makeFdaRssMapper("rss:fda:press", "FDA_PRESS_RELEASE");
