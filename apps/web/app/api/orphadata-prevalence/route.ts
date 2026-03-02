// app/api/orphadata-prevalence/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";

// -----------------------------
// Config
// -----------------------------
const ORPHADATA_BASE = process.env.ORPHADATA_BASE_URL || "https://api.orphadata.com";

// Optional: if your Orphadata access uses an API key in a header.
function orphaHeaders() {
    const h: Record<string, string> = { accept: "application/json" };
    if (process.env.ORPHADATA_API_KEY) h["X-API-KEY"] = process.env.ORPHADATA_API_KEY;
    return h;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 15_000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: ctrl.signal, headers: orphaHeaders() });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    } finally {
        clearTimeout(t);
    }
}

function normalizeDiseaseName(s: string) {
    return s
        .toLowerCase()
        .replace(/\([^)]*\)/g, " ")
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

type OrphaLookup = { orphacode: string; label: string };

async function orphaResolveByName(name: string, lang = "en"): Promise<OrphaLookup | null> {
    const q = name?.trim();
    if (!q) return null;

    // Orphadata: /rd-cross-referencing/orphacodes/names/{name}?lang=en
    const url = new URL(`${ORPHADATA_BASE}/rd-cross-referencing/orphacodes/names/${encodeURIComponent(q)}`);
    url.searchParams.set("lang", lang);

    const data = await fetchJsonWithTimeout(url.toString());
    if (!data) return null;

    // Orphadata often returns { data: { results: [...] } }
    const candidates: any[] =
        (data?.data?.results ??
            data?.results ??
            data?.data ??
            data?.orphacodes ??
            data?.Orphacodes ??
            data?.items ??
            []) as any[];

    if (!Array.isArray(candidates) || candidates.length === 0) return null;

    const needle = normalizeDiseaseName(q);

    let best = candidates[0];
    for (const c of candidates) {
        const label =
            (c?.["Preferred term"] ??
                c?.PreferredTerm ??
                c?.preferredTerm ??
                c?.label ??
                c?.name ??
                c?.diseaseName ??
                "") as string;

        if (normalizeDiseaseName(label) === needle) {
            best = c;
            break;
        }
    }

    const orphacode = String(best?.ORPHAcode ?? best?.ORPHA_code ?? best?.orphacode ?? best?.code ?? "").trim();
    const label = String(
        best?.["Preferred term"] ?? best?.PreferredTerm ?? best?.preferredTerm ?? best?.label ?? best?.name ?? ""
    ).trim();

    if (!orphacode) return null;
    return { orphacode, label: label || q };
}

type ParsedPrevalence = {
    ratioValue: number; // numerator
    denominator: number; // denominator
    display?: string;
};

function parsePrevalenceText(s: string): ParsedPrevalence | null {
    // keep original for display, but normalize number formatting:
    // - remove commas
    // - collapse spaces that occur BETWEEN digits (so "10 000" -> "10000")
    const t = s
        .replace(/,/g, "")
        .replace(/(\d)\s+(?=\d)/g, "$1")
        .toLowerCase()
        .trim();

    // X-Y / Z
    let m = t.match(/([<>]?\s*\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (m) {
        const loRaw = m[1].replace(/\s+/g, "");
        const lo = Number(loRaw.replace(/[<>]/g, ""));
        const hi = Number(m[2]);
        const den = Number(m[3]);
        if (!Number.isFinite(lo) || !Number.isFinite(hi) || !Number.isFinite(den) || den <= 0) return null;
        const mid = (lo + hi) / 2;
        return { ratioValue: mid, denominator: den, display: `${loRaw}-${hi}/${den}` };
    }

    // X / Z
    m = t.match(/([<>]?\s*\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
    if (m) {
        const xRaw = m[1].replace(/\s+/g, "");
        const x = Number(xRaw.replace(/[<>]/g, ""));
        const den = Number(m[2]);
        if (!Number.isFinite(x) || !Number.isFinite(den) || den <= 0) return null;
        return { ratioValue: x, denominator: den, display: `${xRaw}/${den}` };
    }

    // X-Y per Z
    m = t.match(/([<>]?\s*\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*per\s*(\d+(?:\.\d+)?)/);
    if (m) {
        const loRaw = m[1].replace(/\s+/g, "");
        const lo = Number(loRaw.replace(/[<>]/g, ""));
        const hi = Number(m[2]);
        const den = Number(m[3]);
        if (!Number.isFinite(lo) || !Number.isFinite(hi) || !Number.isFinite(den) || den <= 0) return null;
        const mid = (lo + hi) / 2;
        return { ratioValue: mid, denominator: den, display: `${loRaw}-${hi} per ${den}` };
    }

    // X per Z
    m = t.match(/([<>]?\s*\d+(?:\.\d+)?)\s*per\s*(\d+(?:\.\d+)?)/);
    if (m) {
        const xRaw = m[1].replace(/\s+/g, "");
        const x = Number(xRaw.replace(/[<>]/g, ""));
        const den = Number(m[2]);
        if (!Number.isFinite(x) || !Number.isFinite(den) || den <= 0) return null;
        return { ratioValue: x, denominator: den, display: `${xRaw} per ${den}` };
    }

    return null;
}

async function orphaFetchPrevalence(orphacode: string, lang = "en") {
    // Orphadata: /rd-epidemiology/orphacodes/{orphacode}?lang=en  ✅ (your curl confirms)
    const url = new URL(`${ORPHADATA_BASE}/rd-epidemiology/orphacodes/${encodeURIComponent(orphacode)}`);
    url.searchParams.set("lang", lang);

    const data = await fetchJsonWithTimeout(url.toString());
    if (!data) return null;

    // Your curl shows: data.data.results is an OBJECT (not array)
    const results = data?.data?.results ?? null;
    if (!results) return null;

    // Prevalence is an array of objects with PrevalenceClass like "1-5 / 10 000"
    const prevArr = results?.Prevalence ?? results?.prevalence ?? results?.Prevalences ?? results?.prevalences;
    if (!Array.isArray(prevArr) || prevArr.length === 0) return null;

    const scored: {
        score: number;
        parsed: ParsedPrevalence;
        raw: string;
        geo?: string;
        source?: string;
    }[] = [];

    for (const e of prevArr) {
        const raw =
            String(
                e?.PrevalenceClass ??
                e?.prevalenceClass ??
                e?.Prevalence ??
                e?.prevalence ??
                e?.Value ??
                e?.value ??
                ""
            ).trim();

        if (!raw) continue;

        const parsed = parsePrevalenceText(raw);
        if (!parsed) continue;

        const geo = String(e?.PrevalenceGeographic ?? e?.prevalenceGeographic ?? e?.GeographicArea ?? e?.geo ?? "").trim() || undefined;
        const g = (geo || "").toLowerCase();
        const score =
            (g.includes("world") || g.includes("global") || g.includes("worldwide") ? 10 : 0) +
            (raw.includes("/") || raw.toLowerCase().includes("per") ? 1 : 0);

        scored.push({
            score,
            parsed,
            raw,
            geo,
            source: String(e?.Source ?? e?.source ?? "").trim() || undefined,
        });
    }

    if (!scored.length) return null;
    scored.sort((a, b) => b.score - a.score);
    return scored[0];
}

// -----------------------------
// Route
// -----------------------------
const BodySchema = z.object({
    diseaseName: z.string().min(1).optional(),
    orphacode: z.string().min(1).optional(),
    lang: z.string().default("en"),
    includeRaw: z.boolean().default(false),
});

export async function POST(req: Request) {
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
    }

    const { diseaseName, orphacode, lang, includeRaw } = parsed.data;

    if (!diseaseName && !orphacode) {
        return NextResponse.json({ success: false, error: "Provide diseaseName or orphacode" }, { status: 400 });
    }

    try {
        const resolved =
            orphacode?.trim()
                ? { orphacode: orphacode.trim(), label: "" }
                : await orphaResolveByName(diseaseName!.trim(), lang);

        if (!resolved?.orphacode) {
            return NextResponse.json({
                success: true,
                found: false,
                orphacode: null,
                prevalence: null,
            });
        }

        const best = await orphaFetchPrevalence(resolved.orphacode, lang);

        if (!best?.parsed) {
            return NextResponse.json({
                success: true,
                found: false,
                orphacode: resolved.orphacode,
                diseaseLabel: resolved.label || diseaseName || null,
                prevalence: null,
            });
        }

        const ratio = Number(best.parsed.ratioValue);
        const den = Number(best.parsed.denominator);
        const ok = Number.isFinite(ratio) && Number.isFinite(den) && ratio > 0 && den > 0;

        return NextResponse.json({
            success: true,
            found: ok,
            orphacode: resolved.orphacode,
            diseaseLabel: resolved.label || diseaseName || null,
            prevalence: ok
                ? {
                    prevalenceNumerator: Math.max(1, Math.round(ratio)),
                    prevalenceDenominator: Math.round(den),
                    prevalenceRatio: ratio / den,
                }
                : null,
            ...(includeRaw
                ? {
                    raw: ok
                        ? {
                            picked: {
                                rawString: best.raw,
                                geo: best.geo ?? null,
                                source: best.source ?? null,
                                parsedDisplay: best.parsed.display ?? null,
                            },
                        }
                        : { picked: null },
                }
                : {}),
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e?.message || "Failed to fetch prevalence" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json(
        {
            ok: true,
            usage: {
                method: "POST",
                bodyExamples: [
                    { diseaseName: "Rett syndrome", lang: "en" },
                    { orphacode: "778", lang: "en", includeRaw: true },
                ],
            },
        },
        { status: 200 }
    );
}
