import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";
import crypto from "node:crypto";
import { buildCtgovParams, type CtgovOrgQueryConfig } from "~web/lib/ctgov-query";
import { fetchCtgovPage, shapeForMapper } from "~web/lib/ctgov";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// app/api/ingest/fetch/ctgov/route.ts
async function getOrgConfigs(): Promise<CtgovOrgQueryConfig[]> {
    return [
        {
            orgId: "org_DEF",
            conditions: ["BRCA1", "BRCA2"],
            terms: ["PARP inhibitor"],
            titles: ["BRCA1", "BRCA2"],

            overallStatuses: ["RECRUITING", "NOT_YET_RECRUITING"],
            windowDays: 14,                  // ← widen the window
            dateField: "LastUpdatePostDate", // ← catch updates too
            loosen: true,                    // ← don’t AND titles+terms strictly
        },
    ];
}

function formatISODate(d: Date) {
    return d.toISOString().slice(0, 10);
}

export async function POST() {
    const provider = "ctgov";
    const eventType = "ctg_trial_posted";
    const results: Record<string, any> = {};

    const cfgs = await getOrgConfigs();

    for (const cfg of cfgs) {
        const stats = (results[cfg.orgId] = { found: 0, enqueued: 0, errors: 0 });

        // Compute window per org
        const to = new Date();
        const from = new Date(to);
        const days = cfg.windowDays ?? 1;
        from.setDate(to.getDate() - days);

        const fromISO = formatISODate(from);
        const toISO = formatISODate(to);

        try {
            let params = buildCtgovParams(cfg, fromISO, toISO);

            // If you want a hard clamp for the upper bound, keep this.
            params.set("postFilter.advanced", `AREA[${cfg.dateField ?? "StudyFirstPostDate"}]RANGE[${fromISO},${toISO}]`);

            let pageToken: string | undefined;
            do {
                const p = new URLSearchParams(params);
                if (pageToken) p.set("pageToken", pageToken);

                const page = await fetchCtgovPage(p);
                const studies = page.studies ?? [];
                stats.found += studies.length;

                for (const s of studies) {
                    try {
                        const shaped = shapeForMapper(s);
                        if (!shaped.NCTId || !shaped.BriefTitle) continue;

                        const dedupeKey = crypto
                            .createHash("sha256")
                            .update(`${provider}:${eventType}:${shaped.NCTId}`)
                            .digest("hex");

                        const posted =
                            s.protocolSection?.statusModule?.studyFirstPostDateStruct?.date ??
                            s.protocolSection?.statusModule?.lastUpdatePostDateStruct?.date;

                        const occurredAt = posted ? new Date(posted) : new Date();

                        await prisma.rawIngestEvent.upsert({
                            where: { dedupeKey },
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
                        console.error("ctgov enqueue error", { orgId: cfg.orgId, e });
                    }
                }

                pageToken = page.nextPageToken;
            } while (pageToken);
        } catch (e) {
            stats.errors++;
            console.error("ctgov org ingest error", { orgId: cfg.orgId, e });
        }
    }

    return NextResponse.json({ provider: "ctgov", results });
}
