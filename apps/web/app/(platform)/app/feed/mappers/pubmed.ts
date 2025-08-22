// app/(platform)/app/feed/mappers/pubmed.ts
import crypto from "node:crypto";
import { register } from "~web/app/(platform)/app/feed/registry";

type EnqueuedArticle = {
    pmid: string;
    title: string;
    abstract?: string;
    keywords?: string[];
    authors?: { name: string; affiliation: string }[];
    publishedDate?: string; // YYYY/MM/DD
    orgId?: string;
};

register("eutils:pubmed", "pubmed_article", async ({ payload, occurredAt }) => {
    const a = payload as EnqueuedArticle;
    if (!a?.pmid || !a?.title) return null;

    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`eutils:pubmed:${a.pmid}`)
        .digest("hex");

    // Prefer the accepted/published date you parsed; fall back to event occurredAt
    const when = a.publishedDate ? new Date(a.publishedDate) : occurredAt ?? new Date();

    return {
        type: "PAPER_PUBLISHED_AGNOSTIC",
        source: "THIRD_PARTY",
        title: a.title,
        content: {
            pmid: a.pmid,
            abstract: a.abstract,
            keywords: a.keywords ?? [],
            authors: (a.authors ?? []).map(x => x.name).filter(Boolean),
        },
        externalUrl: `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`,
        occurredAt: when,
        idempotencyKey,
        orgId: a.orgId,
    };
});
