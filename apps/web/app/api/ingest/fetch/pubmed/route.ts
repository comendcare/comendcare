// app/api/ingest/fetch/pubmed/route.ts
import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";
import crypto from "node:crypto";
import { buildPubmedQuery, type OrgQueryConfig } from "~web/lib/pubmed-query";
import { getPubMedSearchResultIds, getPubMedSearchResultData } from "@comend/lib/pubmed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // ensure Node runtime

async function getOrgConfigsFromDB(prisma: PrismaClient): Promise<OrgQueryConfig[]> {
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
        const condTerms = o.conditions.flatMap(c => [
            c.condition?.name,
            ...(c.condition?.synonyms ?? []),
        ]).filter(Boolean) as string[];

        const geneTerms = o.tools.flatMap(t => [
            t.gene?.symbol,
            ...(t.gene?.aliasSymbols ?? []),
        ]).filter(Boolean) as string[];

        const therapeuticTerms = o.therapeuticsOfInterest ?? [];
        const milestoneHints = o.milestones.map(m => m.title).filter(Boolean);

        // Heuristic: prioritize genes + conditions
        const keywords = Array.from(new Set([
            ...geneTerms,
            ...condTerms,
            ...therapeuticTerms,
        ])).slice(0, 40); // To keep short

        // Example policy: require at least one canonical identifier in title
        const mustInTitle = Array.from(new Set(
            geneTerms.slice(0, 10) // keep short; PubMed queries can explode
        )).slice(0, 10);

        return { orgId: o.id, keywords, mustInTitle };
    }).filter(cfg => cfg.keywords.length > 0);
}

export async function POST() {
    const provider = "eutils:pubmed";
    const eventType = "pubmed_article";
    const results: Record<string, any> = {};

    const cfgs = await getOrgConfigsFromDB(prisma);

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

            // Ask PubMed for IDs published between yesterday and today, max 10
            const ids = await getPubMedSearchResultIds(
                `${query} AND ("${fmt(yesterday)}"[dp] : "${fmt(today)}"[dp])`,
                0,
                10
            );

            orgStats.found = ids.length;
            if (ids.length === 0) continue;

            const articles = await getPubMedSearchResultData(ids);

            for (const article of articles) {
                try {
                    if (!article?.pmid || !article?.title) continue;

                    const dedupeKey = crypto
                        .createHash("sha256")
                        .update(`${provider}:${eventType}:${cfg.orgId}:${article.pmid}`)
                        .digest("hex");

                    const occurredAt = article.publishedDate ? new Date(article.publishedDate) : new Date();

                    await prisma.rawIngestEvent.upsert({
                        where: { dedupeKey },
                        update: { payload: { ...article, orgId: cfg.orgId } as any },
                        create: {
                            dedupeKey,
                            provider,
                            eventType,
                            externalId: article.pmid,
                            occurredAt,
                            receivedAt: new Date(),
                            payload: { ...article, orgId: cfg.orgId } as any,
                            status: "PENDING",
                        },
                    });

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
