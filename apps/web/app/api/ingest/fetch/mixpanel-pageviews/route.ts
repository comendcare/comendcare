// app/api/ingest/check-org-views/route.ts
import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- config ----------
/**
 * Where to fetch your own internal Mixpanel proxy from.
 * NEXT_PUBLIC_BASE_URL is ideal in production. Fallback helps in dev.
 * Examples:
 *   https://app.comend.io
 *   http://localhost:3000
 */
const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") || "http://localhost:3000";

/** Which milestones to celebrate. Tweak as you like. */
const MILESTONES = [10, 100, 1_000, 10_000, 100_000, 1_000_000];

// ---------- helpers ----------
function stableDedupeKey(orgId: string, milestone: number) {
    return crypto
        .createHash("sha256")
        .update(`app:org_profile_views_milestone:${orgId}:${milestone}`)
        .digest("hex");
}

/** Returns the host to query for public profile views. Adjust to your schema. */
function publicHostForOrg(org: {
    subdomain?: string | null;
}) {
    if (org.subdomain) return `${org.subdomain}.comend.io`;
    return null;
}

/** Highest milestone already emitted for an org (if any). */
async function getMaxEmittedMilestone(orgId: string) {
    const items = await prisma.feedItem.findMany({
        where: { orgId, type: "ORG_PROFILE_VIEWS_MILESTONE" as any },
        select: { content: true },
        orderBy: { occurredAt: "desc" },
        take: 50,
    });
    let max = 0;
    for (const it of items) {
        const m = Number((it.content as any)?.milestone ?? 0);
        if (Number.isFinite(m) && m > max) max = m;
    }
    return max || null;
}

/** Of the configured milestones, return the highest one newly crossed. */
function newlyCrossedMilestone(total: number, alreadyMax?: number | null) {
    const crossed = MILESTONES.filter((m) => total >= m);
    if (crossed.length === 0) return null;
    const highestCrossed = crossed[crossed.length - 1];
    if (alreadyMax && highestCrossed <= alreadyMax) return null;
    return highestCrossed;
}

/** Sum total page views from Mixpanel proxy for the given host. */
async function fetchLifetimeViewsForHost(host: string) {
    // If you know project launch date, use that instead of 2018-01-01
    const from = "2018-01-01";
    const to = new Date().toISOString().slice(0, 10);
    const url = new URL(`${BASE_URL}/api/mixpanel-pageviews`);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    url.searchParams.set("host", host);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) throw new Error(`mixpanel-pageviews failed ${res.status}`);
    const rows = (await res.json()) as Array<{ date: string; pageViews: number }>;
    return rows.reduce((acc, r) => acc + (r.pageViews || 0), 0);
}

/** Pull orgs that have a public host/subdomain. Adjust the select to your schema. */
async function getOrgsWithHosts() {
    return prisma.organization.findMany({
        select: {
            id: true,
            name: true,
            subdomain: true,
        },
    });
}

// ---------- main ----------
async function runCheck() {
    const orgs = await getOrgsWithHosts();
    let checked = 0;
    let created = 0;

    for (const org of orgs) {
        const host = publicHostForOrg(org);
        if (!host) continue;

        checked++;

        try {
            const totalViews = await fetchLifetimeViewsForHost(host);
            const alreadyMax = await getMaxEmittedMilestone(org.id);
            const milestone = newlyCrossedMilestone(totalViews, alreadyMax);
            if (!milestone) continue;

            const occurredAt = new Date();
            const payload = {
                orgId: org.id,
                orgName: org.name,
                host,
                totalViews,
                milestone,
            };

            // IMPORTANT: include dedupeKey so Prisma create type is satisfied and idempotent.
            const dedupeKey = stableDedupeKey(org.id, milestone);

            // Prefer upsert on dedupeKey (must be UNIQUE in your Prisma schema)
            await prisma.rawIngestEvent.upsert({
                where: { dedupeKey },
                update: {
                    occurredAt,
                    payload: payload,
                    status: "PENDING",
                    error: null,
                },
                create: {
                    provider: "app",
                    eventType: "org_profile_views_milestone",
                    occurredAt,
                    status: "PENDING",
                    payload: payload,
                    dedupeKey,
                    externalId: `${org.id}:${milestone}`, // optional, helps debugging
                },
            });

            created++;
        } catch (err) {
            // Log a failed raw event row for observability
            await prisma.rawIngestEvent.create({
                data: {
                    provider: "app",
                    eventType: "org_profile_views_milestone",
                    occurredAt: new Date(),
                    status: "FAILED",
                    error: String(err),
                    payload: {
                        orgId: org.id,
                        orgName: org.name,
                        host,
                    },
                    dedupeKey: stableDedupeKey(org.id, -1), // harmless unique key for failure row
                },
            });
        }
    }

    return { checked, created };
}

export async function POST() {
    const { checked, created } = await runCheck();
    return NextResponse.json({ checked, created });
}

export async function GET() {
    return POST();
}
