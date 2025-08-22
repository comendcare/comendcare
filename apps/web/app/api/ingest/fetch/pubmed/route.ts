// app/api/ingest/fetch/pubmed/route.ts
import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";
import crypto from "node:crypto";
import { buildPubmedQuery, type OrgQueryConfig } from "~web/lib/pubmed-query";
import { getPubMedSearchResultIds, getPubMedSearchResultData } from "@comend/lib/pubmed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // ensure Node runtime

async function getOrgConfigs(): Promise<OrgQueryConfig[]> {
    return [
        // { orgId: "org_ABC", keywords: ["Duchenne muscular dystrophy", "DMD", "dystrophin"] },
        { orgId: "org_DEF", keywords: ["BRCA1", "BRCA2", "PARP inhibitor"], mustInTitle: ["BRCA1", "BRCA2"] },
    ];
}

export async function POST() {
    const provider = "eutils:pubmed";
    const eventType = "pubmed_article";
    const results: Record<string, any> = {};

    const cfgs = await getOrgConfigs();

    for (const cfg of cfgs) {
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
                        .update(`${provider}:${eventType}:${article.pmid}`)
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
