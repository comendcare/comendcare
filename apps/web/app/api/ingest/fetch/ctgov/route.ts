import {NextResponse} from "next/server";
import prisma from "@comend/lib/prisma";
import crypto from "node:crypto";
import {buildCtgovParams, runSimpleFallback, CtgovOrgQueryConfig} from "~web/lib/ctgov-query";
import {CtgovStudy, fetchCtgovPage, shapeForMapper} from "~web/lib/ctgov";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";


function chunk<T>(arr: T[], size: number): T[][] {
    if (size <= 0) return [arr.slice()];
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

async function fetchAllPages(
    baseParams: URLSearchParams,
    handleStudies: (studies: CtgovStudy[]) => Promise<void>
) {
    let pageToken: string | undefined;
    do {
        const p = new URLSearchParams(baseParams);
        if (pageToken) p.set("pageToken", pageToken);
        const page = await fetchCtgovPage(p);
        const studies = page.studies ?? [];
        await handleStudies(studies);
        pageToken = page.nextPageToken;
    } while (pageToken);
}

function isTooComplicatedError(e: unknown) {
    const msg = String(e || "");
    return msg.includes("400") && /Too complicated query/i.test(msg);
}

// Build CT.gov query configs for ALL published orgs from your DB
async function getOrgConfigsFromDB(): Promise<CtgovOrgQueryConfig[]> {
    const orgs = await prisma.organization.findMany({
        where: {published: true},
        select: {
            id: true,
            therapeuticsOfInterest: true,
            // org ↔ conditions
            conditions: {
                include: {
                    condition: {
                        select: {name: true, synonyms: true},
                    },
                },
            },
            // org ↔ tools (for genes)
            tools: {
                include: {
                    gene: {select: {symbol: true, aliasSymbols: true}},
                },
            },
            // optional: milestone titles as loose hints
            milestones: {select: {title: true}},
        },
    });

    const uniq = <T, >(xs: T[]) => Array.from(new Set(xs));
    const nonempty = (s: string | null | undefined): s is string => !!s && s.trim().length > 0;

    return orgs
        .map((o) => {
            const condTerms = o.conditions
                .flatMap((c) => [c.condition?.name, ...(c.condition?.synonyms ?? [])])
                .filter(nonempty);

            const geneTerms = o.tools
                .flatMap((t) => [t.gene?.symbol, ...(t.gene?.aliasSymbols ?? [])])
                .filter(nonempty);

            const therapeuticTerms = (o.therapeuticsOfInterest ?? []).filter(nonempty);

            const milestoneHints = o.milestones.map((m) => m.title).filter(nonempty);

            // Keep queries reasonable in size
            const conditions = uniq(condTerms).slice(0, 50);
            const terms = uniq([...geneTerms, ...therapeuticTerms]).slice(0, 50);
            const titles = uniq([...geneTerms, ...condTerms, ...milestoneHints]).slice(0, 20);

            const hasAny = conditions.length || terms.length || titles.length;
            if (!hasAny) return null;

            const cfg: CtgovOrgQueryConfig = {
                orgId: o.id,
                conditions,
                terms,
                titles,
                overallStatuses: ["RECRUITING", "NOT_YET_RECRUITING"], // sane default
                windowDays: 14,
                dateField: "LastUpdatePostDate",
                loosen: true,
            };
            return cfg;
        })
        .filter((x): x is CtgovOrgQueryConfig => !!x);
}

function formatISODate(d: Date) {
    return d.toISOString().slice(0, 10);
}

export async function POST() {
    const provider = "ctgov";
    const eventType = "ctg_trial_posted";
    const results: Record<string, any> = {};

    const cfgs = await getOrgConfigsFromDB();

    for (const cfg of cfgs) {
        const stats = (results[cfg.orgId] = {found: 0, enqueued: 0, errors: 0});

        // Compute window per org
        const to = new Date();
        const from = new Date(to);
        const days = cfg.windowDays ?? 1;
        from.setDate(to.getDate() - days);

        const fromISO = formatISODate(from);
        const toISO = formatISODate(to);

        try {
            const seen = new Set<string>(); // in‑memory guard to reduce duplicate work within this run

            const enqueueStudies = async (studies: CtgovStudy[]) => {
                stats.found += studies.length;

                for (const s of studies) {
                    try {
                        const shaped = shapeForMapper(s);
                        if (!shaped.NCTId || !shaped.BriefTitle) continue;

                        // avoid double work within this handler (prisma upsert also dedupes)
                        const localKey = `${cfg.orgId}:${shaped.NCTId}`;
                        if (seen.has(localKey)) continue;
                        seen.add(localKey);

                        const posted =
                            s.protocolSection?.statusModule?.studyFirstPostDateStruct?.date ??
                            s.protocolSection?.statusModule?.lastUpdatePostDateStruct?.date;
                        const occurredAt = posted ? new Date(posted) : new Date();

                        const dedupeKey = crypto
                            .createHash("sha256")
                            .update(`ctgov:ctg_trial_posted:${cfg.orgId}:${shaped.NCTId}`)
                            .digest("hex");

                        await prisma.rawIngestEvent.upsert({
                            where: {dedupeKey},
                            update: {
                                payload: {
                                    NCTId: shaped.NCTId,
                                    BriefTitle: shaped.BriefTitle,
                                    CurrentRecruitmentStatus: shaped.CurrentRecruitmentStatus,
                                    Conditions: shaped.Conditions,
                                    Locations: shaped.Locations,
                                    orgId: cfg.orgId,
                                } as any,
                            },
                            create: {
                                dedupeKey,
                                provider,
                                eventType,
                                externalId: shaped.NCTId,
                                occurredAt,
                                receivedAt: new Date(),
                                payload: {
                                    NCTId: shaped.NCTId,
                                    BriefTitle: shaped.BriefTitle,
                                    CurrentRecruitmentStatus: shaped.CurrentRecruitmentStatus,
                                    Conditions: shaped.Conditions,
                                    Locations: shaped.Locations,
                                    orgId: cfg.orgId,
                                } as any,
                                status: "PENDING",
                            },
                        });

                        stats.enqueued++;
                    } catch (e) {
                        stats.errors++;
                        console.error("ctgov enqueue error", {orgId: cfg.orgId, e});
                    }
                }
            };

            try {
                // 1) Try the full query first (as you had it)
                let params = buildCtgovParams(cfg, fromISO, toISO);
                params.set(
                    "postFilter.advanced",
                    `AREA[${cfg.dateField ?? "StudyFirstPostDate"}]RANGE[${fromISO},${toISO}]`
                );
                if (cfg.overallStatuses?.length) {
                    params.set("postFilter.overallStatus", cfg.overallStatuses.join(","));
                }

                await fetchAllPages(params, enqueueStudies);
            } catch (e) {
                if (!isTooComplicatedError(e)) {
                    stats.errors++;
                    console.error("ctgov org ingest error", {orgId: cfg.orgId, e});
                } else {
                    await runSimpleFallback(cfg, fromISO, toISO, enqueueStudies);
                }
            }
        } catch (e) {
            stats.errors++;
            console.error("ctgov org ingest error", {orgId: cfg.orgId, e});
        }
    }

    return NextResponse.json({provider: "ctgov", results});
}

export async function GET() {
    return POST();
}
