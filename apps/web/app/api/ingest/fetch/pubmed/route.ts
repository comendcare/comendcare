// app/api/ingest/fetch/pubmed/route.ts
import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";
import crypto from "node:crypto";
import { buildPubmedQuery, type OrgQueryConfig } from "~web/lib/pubmed-query";
import { getPubMedSearchResultIds, getPubMedSearchResultData } from "@comend/lib/pubmed";
import type {PrismaClient} from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // ensure Node runtime

const clean = (s?: string | null) =>
    (s ?? "").replace(/"/g, "'").replace(/\s+/g, " ").trim();

const uniq = <T,>(xs: T[]) => Array.from(new Set(xs));

async function getOrgConfigsFromDB(): Promise<OrgQueryConfig[]> {
    const orgs = await prisma.organization.findMany({
        where: { published: true }, // or verified, etc.
        include: {
            conditions: {
                include: { condition: { select: { name: true, synonyms: true } } },
            },
            tools: { include: { gene: { select: { symbol: true, aliasSymbols: true } } } },
            milestones: { select: { title: true } },
        },
    });

    return orgs.map((o) => {
        const condTerms = o.conditions
            .flatMap(c => [c.condition?.name, ...(c.condition?.synonyms ?? [])])
            .map(clean).filter(Boolean);

        const geneTerms = o.tools
            .flatMap(t => [t.gene?.symbol, ...(t.gene?.aliasSymbols ?? [])])
            .map(clean).filter(Boolean);

        const therapeuticTerms = (o.therapeuticsOfInterest ?? []).map(clean).filter(Boolean);

// Heuristic: prioritize genes + conditions; cap sizes
        const keywords = uniq([...geneTerms, ...condTerms, ...therapeuticTerms]).slice(0, 40);
        const mustInTitle = uniq(geneTerms).slice(0, 10);

        return { orgId: o.id, keywords, mustInTitle };
    }).filter(cfg => cfg.keywords.length > 0);
}

export async function POST() {
    const provider = "eutils:pubmed";
    const eventType = "pubmed_article";
    const results: Record<string, any> = {};

    const cfgs = await getOrgConfigsFromDB();

    for (const cfg of cfgs) {
        if (!cfg.keywords?.length && !cfg.mustInTitle?.length) continue;

        const query = buildPubmedQuery(cfg);
        const orgStats = (results[cfg.orgId] = { found: 0, enqueued: 0, errors: 0, query });

        try {
            // 📅 yesterday → today
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            // format as YYYY/MM/DD (PubMed format)
            const fmt = (d: Date) => d.toISOString().split("T")[0].replace(/-/g, "/");

            // Build the raw term and a safe, URL-encoded version
            const rawTerm = `${query} AND ("${fmt(yesterday)}"[dp] : "${fmt(today)}"[dp])`;
            const encodedTerm = encodeURIComponent(rawTerm);

            let ids: number[] = [];
            try {
                ids = await getPubMedSearchResultIds(encodedTerm, 0, 3); // bump to 20 if you like
            } catch (e) {
                orgStats.errors++;
                console.error("esearch error", { orgId: cfg.orgId, e, rawTerm });
                continue; // skip this org this run
            }

            orgStats.found = ids.length;
            if (ids.length === 0) continue;

            let articles: any[] = [];
            try {
                articles = await getPubMedSearchResultData(ids);
            } catch (e) {
                orgStats.errors++;
                console.error("efetch error", { orgId: cfg.orgId, e, idsSample: ids.slice(0,5) });
                continue; // skip to next org
            }
            for (const article of articles) {
                try {
                    if (!article?.pmid || !article?.title) continue;

                    const dedupeKey = crypto
                        .createHash("sha256")
                        .update(`${provider}:${eventType}:${cfg.orgId}:${article.pmid}`)
                        .digest("hex");

                    const occurredAt =
                        article.publishedDateISO && !Number.isNaN(Date.parse(article.publishedDateISO))
                            ? new Date(article.publishedDateISO)
                            : new Date(); // fallback to "now" if missing/invalid

                    await prisma.rawIngestEvent.upsert({
                        where: { dedupeKey },
                        update: { payload: { ...article, orgId: cfg.orgId } as any },
                        create: {
                            dedupeKey,
                            provider,
                            eventType,
                            externalId: article.pmid,
                            occurredAt,                   // ✅ always a valid Date
                            receivedAt: new Date(),
                            payload: { ...article, orgId: cfg.orgId } as any,
                            status: "PENDING",
                        },
                    })

                    orgStats.enqueued++;
                } catch (e) {
                    orgStats.errors++;
                    console.error("enqueue error", { orgId: cfg.orgId, pmid: article.pmid, e });
                }
            }
        } catch (e) {
            orgStats.errors++;
            console.error("org ingest error", { orgId: cfg.orgId, e, query });
        }
    }

    return NextResponse.json({ provider, results });
}

export async function GET() {
    return POST();
}
