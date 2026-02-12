// app/api/chat/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";

export const dynamic = "force-dynamic";

type Message = { role: "user" | "assistant"; content: string };

type ChatBody = {
    messages: Message[];
    personaSystem?: string;
    orgId?: string | null;

    // OPTIONAL: allow client to request more items when listing
    page?: number;
    perPage?: number;
};

type CollectionName =
    | "organizations"
    | "milestones"
    | "companies"
    | "biosamples"
    | "disease-models"
    | "clinical-datasets"
    | "rfps"
    | "research-plans"
    | "researchers";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// ===== URL BUILDING =====
const BASE_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"

const url = new URL(BASE_URL)

const PUBLIC_PROTOCOL = url.protocol.replace(":", "")
const PUBLIC_HOST = url.host

function hostForOrg(orgSubdomain?: string) {
    return orgSubdomain ? `${orgSubdomain}.${PUBLIC_HOST}` : PUBLIC_HOST;
}
function absoluteUrl(path: string, orgSubdomain?: string) {
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${PUBLIC_PROTOCOL}://${hostForOrg(orgSubdomain)}${p}`;
}

function publicItemUrl(collection: CollectionName, doc: any) {
    const id = String(doc?.id ?? "");
    const slug = String(doc?.slug ?? "");
    const orgSubdomain =
        doc?.__orgSubdomain ||
        doc?.subdomain ||
        doc?.organization?.subdomain ||
        doc?.organizationSubdomain ||
        undefined;

    switch (collection) {
        case "organizations":
            return absoluteUrl("/", orgSubdomain);

        case "research-plans":
            return absoluteUrl(`/research-plan/${id}`, orgSubdomain);

        case "rfps":
            return absoluteUrl(`/rfp/${id}`, orgSubdomain);

        case "companies":
            return absoluteUrl(`/company/${slug || id}`, orgSubdomain);

        case "researchers":
            return absoluteUrl(`/profile/${id}`, orgSubdomain);

        case "biosamples":
            return absoluteUrl(`/marketplace/biosamples/${id}`, orgSubdomain);

        case "disease-models":
            return absoluteUrl(`/marketplace/disease-models/${id}`, orgSubdomain);

        case "clinical-datasets":
            return absoluteUrl(`/marketplace/clinical-datasets/${id}`, orgSubdomain);

        case "milestones":
            return absoluteUrl(`/milestone/${id}`, orgSubdomain);

        default:
            return absoluteUrl("/", orgSubdomain);
    }
}

type Rewritten = {
    q: string;                     // the query string for Typesense
    intent?: "count" | "list" | "search";
    entity?: { orgName?: string }; // extracted org name if any
    targetCollections?: CollectionName[]; // optional narrowing
};

function sanitizeTypesenseQ(q: string) {
    return (q ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200); // keep it short
}

async function rewriteForTypesense(userText: string) : Promise<Rewritten> {
    const prompt = `
You rewrite user questions into a Typesense-searchable query string.

Rules:
- Output MUST be valid JSON only (no markdown).
- "q" MUST be a short string of 2-8 keywords / phrases.
- Remove filler words like: how, many, does, have, show, list, tell me, please.
- Keep proper nouns, acronyms, and disease/org names intact.
- If an organization name is present, put it into entity.orgName exactly as it appears in the user text.
- Do NOT invent ids, filters, or facts. Do NOT guess collections unless obvious.
- If user asks "how many research plans does X have", set intent="count" and targetCollections=["research-plans"] and include X in q.
- Otherwise intent="search".

User text:
${JSON.stringify(userText)}
`;

    const r = await openai.responses.create({
        model: "gpt-5-nano",
        input: [{ role: "system", content: prompt }],
    });

    const raw = r.output_text?.trim() ?? "";
    try {
        const parsed = JSON.parse(raw) as Rewritten;
        const q = sanitizeTypesenseQ(parsed.q);
        if (!q) throw new Error("empty q");
        return { ...parsed, q };
    } catch {
        // fallback: cheap heuristic
        const fallback = userText
            .replace(/[?.,!]/g, " ")
            .replace(/\b(how|many|does|do|have|show|list|tell|me|please|what|is|are|the|a|an)\b/gi, " ")
            .replace(/\s+/g, " ")
            .trim();
        return { q: sanitizeTypesenseQ(fallback) || sanitizeTypesenseQ(userText), intent: "search" };
    }
}

type MultiSearchHit = {
    document?: any;
    highlights?: Array<{ field: string; snippet?: string; snippets?: string[] }>;
    text_match?: number;
};

type MultiSearchResult = {
    hits?: MultiSearchHit[];
    request_params?: { collection_name?: string };
    search?: { collection?: string };
};

function normalizeForCompare(s: string) {
    return (s ?? "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function tokenOverlapScore(a: string, b: string) {
    const A = new Set(normalizeForCompare(a).split(" ").filter(Boolean));
    const B = new Set(normalizeForCompare(b).split(" ").filter(Boolean));
    if (!A.size || !B.size) return 0;
    let inter = 0;
    A.forEach((t) => {
        if (B.has(t)) inter++;
    });
    // prefer overlap relative to query length
    return inter / Math.max(1, A.size);
}

function candidateOrgQueries(raw: string) {
    const base = (raw ?? "").trim();
    if (!base) return [];

    // If user asks "How many research plans does X have", X might be a gene token
    // but orgs are often "X Foundation", "X Association", etc.
    const suffixes = [
        "", // original
        " foundation",
        " association",
        " advocacy",
        " alliance",
        " research foundation",
        " syndrome foundation",
        " connect",
        " network",
        " initiative",
        " group",
        " org",
        " organization",
    ];

    // de-dupe while preserving order
    const seen = new Set<string>();
    const out: string[] = [];
    for (const suf of suffixes) {
        const q = sanitizeTypesenseQ(`${base}${suf}`.trim());
        if (!q) continue;
        const key = q.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(q);
    }
    return out.slice(0, 8);
}

function bestSnippet(hit: MultiSearchHit): string | undefined {
    const hs = hit.highlights ?? [];
    const first = hs.find((h) => h.snippet)?.snippet;
    if (first) return first;
    const firstFromSnippets = hs.find((h) => Array.isArray(h.snippets) && h.snippets.length)?.snippets?.[0];
    return firstFromSnippets;
}

function getTypesenseConfig() {
    const TYPESENSE_NODE = process.env.NEXT_PUBLIC_TYPESENSE_NODE;
    const searchKey = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY;

    if (!TYPESENSE_NODE) throw new Error("Missing env NEXT_PUBLIC_TYPESENSE_NODE");
    if (!searchKey) throw new Error("Missing env NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY");

    const TYPESENSE_URL = `https://${TYPESENSE_NODE}`.replace(/\/$/, "");
    return { TYPESENSE_URL, searchKey };
}

/**
 * Very lightweight intent detection. Keep it simple and deterministic.
 * You can expand this over time.
 */
type Intent =
    | { kind: "count_orgs" }
    | { kind: "list_orgs"; page: number; perPage: number }
    | { kind: "count_research_plans_for_org"; orgName?: string; orgId?: string | null }
    | { kind: "normal_search"; q: string };

function detectIntent(userText: string, body: ChatBody): Intent {
    const q = (userText ?? "").trim();
    const lower = q.toLowerCase();

    if (/\bhow many\b/.test(lower) && (/\borgs?\b/.test(lower) || /\borganizations?\b/.test(lower))) {
        return { kind: "count_orgs" };
    }

    if (
        (/\b(list|show|all)\b/.test(lower) && (/\borgs?\b/.test(lower) || /\borganizations?\b/.test(lower))) ||
        lower === "organizations" ||
        lower === "orgs"
    ) {
        const page = Number.isFinite(body.page) && (body.page as number) > 0 ? (body.page as number) : 1;
        const perPageRaw = Number.isFinite(body.perPage) && (body.perPage as number) > 0 ? (body.perPage as number) : 25;
        const perPage = Math.max(1, Math.min(perPageRaw, 100));
        return { kind: "list_orgs", page, perPage };
    }

    // NEW: count research plans
    if (/\bhow many\b/.test(lower) && /\bresearch plans?\b/.test(lower)) {
        // if client already set orgId, use it
        if (body.orgId) return { kind: "count_research_plans_for_org", orgId: body.orgId };

        // otherwise try to extract org name with your rewrite step later (don’t guess here)
        return { kind: "count_research_plans_for_org" };
    }

    return { kind: "normal_search", q };
}

async function searchOrganizations(opts: { q: string; perPage?: number }) {
    const { TYPESENSE_URL, searchKey } = getTypesenseConfig();

    const q = (opts.q ?? "").trim();
    if (!q) return [];

    const url = new URL(`${TYPESENSE_URL}/collections/organizations/documents/search`);
    url.searchParams.set("q", q);
    url.searchParams.set("query_by", "name,description");
    url.searchParams.set("per_page", String(opts.perPage ?? 10));

    // make org lookup forgiving + ranked well
    url.searchParams.set("prefix", "true");
    url.searchParams.set("exhaustive_search", "true");
    url.searchParams.set("num_typos", "2");
    url.searchParams.set("typo_tokens_threshold", "1");
    url.searchParams.set("prioritize_exact_match", "true");

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "X-TYPESENSE-API-KEY": searchKey },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Typesense organizations search failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    const hits = (json?.hits ?? []) as Array<{ document?: any; text_match?: number }>;

    return hits
        .map((h) => {
            const doc = h.document ?? {};
            const id = String(doc.id ?? "");
            if (!id) return null;

            const title = String(doc.name ?? "(untitled)");
            const orgSubdomain = doc.subdomain || undefined;
            const url = publicItemUrl("organizations", { ...doc, __orgSubdomain: orgSubdomain });

            return {
                id,
                title,
                url,
                score: Number(h.text_match ?? 0),
                doc,
            };
        })
        .filter(Boolean) as Array<{ id: string; title: string; url: string; score: number; doc: any }>;
}

async function resolveOrgFromQuery(raw: string) {
    const queries = candidateOrgQueries(raw);
    if (!queries.length) return null;

    let best:
        | { orgId: string; orgUrl: string; orgTitle: string; score: number }
        | null = null;

    for (const q of queries) {
        const hits = await searchOrganizations({ q, perPage: 10 });
        if (!hits.length) continue;

        // Choose best by: overlap with the *raw* query + Typesense score
        // (overlap dominates to avoid "wrong org" surprises)
        hits.sort((a, b) => {
            const oa = tokenOverlapScore(raw, a.title);
            const ob = tokenOverlapScore(raw, b.title);
            if (ob !== oa) return ob - oa;
            return b.score - a.score;
        });

        const top = hits[0];
        const candidate = {
            orgId: top.id,
            orgUrl: top.url,
            orgTitle: top.title,
            score: tokenOverlapScore(raw, top.title) * 10_000 + top.score,
        };

        if (!best || candidate.score > best.score) best = candidate;

        // If it’s an extremely good match, stop early
        if (tokenOverlapScore(raw, top.title) >= 0.9) break;
    }

    if (!best) return null;
    const { orgId, orgUrl, orgTitle } = best;
    return { orgId, orgUrl, orgTitle };
}

async function countResearchPlansForOrg(orgId: string) {
    return prisma.roadmap.count({
        where: { organizationId: orgId },
    });
}

async function getOrganizationsCountNoAdmin() {
    const { TYPESENSE_URL, searchKey } = getTypesenseConfig();

    const url = new URL(`${TYPESENSE_URL}/collections/organizations/documents/search`);
    url.searchParams.set("q", "*");
    url.searchParams.set("query_by", "name,description");
    url.searchParams.set("per_page", "1");

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "X-TYPESENSE-API-KEY": searchKey,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Typesense org count search failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    return Number(json?.found ?? 0);
}

/**
 * List orgs with q="*" (paged). This is for “show me all orgs”.
 */
async function listOrganizations(opts: { page: number; perPage: number }) {
    const { TYPESENSE_URL, searchKey } = getTypesenseConfig();

    const url = new URL(`${TYPESENSE_URL}/collections/organizations/documents/search`);
    url.searchParams.set("q", "*");
    url.searchParams.set("query_by", "name,description");
    url.searchParams.set("page", String(opts.page));
    url.searchParams.set("per_page", String(opts.perPage));

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "X-TYPESENSE-API-KEY": searchKey,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Typesense organizations list failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    const hits = (json?.hits ?? []) as Array<{ document: any; text_match?: number; highlights?: any }>;

    const items = hits
        .map((h) => {
            const doc = h.document ?? {};
            const id = String(doc.id ?? "");
            if (!id) return null;

            const title = String(doc.name ?? "(untitled)");
            const snippet = bestSnippet({ highlights: h.highlights } as any);
            const about = String(snippet || doc.description || "").slice(0, 800);

            const orgSubdomain = doc.subdomain || undefined;
            const url = publicItemUrl("organizations", { ...doc, __orgSubdomain: orgSubdomain });

            return { collection: "organizations" as const, id, title, about, url };
        })
        .filter(Boolean) as Array<{ collection: "organizations"; id: string; title: string; about: string; url: string }>;

    return {
        found: Number(json?.found ?? items.length),
        page: opts.page,
        perPage: opts.perPage,
        items,
    };
}

/**
 * multi_search, but:
 * - allow more per collection
 * - return more than 20 (cap higher)
 * - include collectionName reliably
 */
async function typesenseMultiSearch(opts: { q: string }) {
    const { TYPESENSE_URL, searchKey } = getTypesenseConfig();

    const q = (opts.q ?? "").trim();
    if (!q) return [];

    const searches = [
        { collection: "organizations", q, query_by: "name,description" },
        { collection: "milestones", q, query_by: "title,description,type,status,nodeType" },
        { collection: "companies", q, query_by: "title,description,headquarters,companyType,categories,tags" },
        {
            collection: "biosamples",
            q,
            query_by:
                "id,description,organization.name,institution.name,donor.id,gene.symbol,type.label,condition.name,genotype.genotype,availability.value",
        },
        {
            collection: "disease-models",
            q,
            query_by:
                "id,description,organization.name,institution.name,gene.symbol,type.label,condition.name,genotype.genotype,strain.strain",
        },
        {
            collection: "clinical-datasets",
            q,
            query_by: "id,title.title,description,organization.name,institution.name,gene.symbol,type.label,condition.name",
        },
        { collection: "rfps", q, query_by: "id,title,description,eligibility,evaluationProcess,organization.name,condition.name" },
        { collection: "research-plans", q, query_by: "id,title,description,organization.name" },
        { collection: "researchers", q, query_by: "user.name,researchInterests,therapeuticsOfInterest" },
    ] as const;

    const body = {
        searches: searches.map((s) => ({
            collection: s.collection,
            q: s.q,
            query_by: s.query_by,

            per_page: 10,

            prefix: true,
            exhaustive_search: true,
            num_typos: 2,
            typo_tokens_threshold: 1,
            prioritize_exact_match: true,
            highlight_full_fields: s.query_by,
        })),
    };

    const res = await fetch(`${TYPESENSE_URL}/multi_search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-TYPESENSE-API-KEY": searchKey,
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Typesense multi_search failed: ${res.status} ${text}`);
    }

    const json = (await res.json()) as { results?: MultiSearchResult[] };

    const out: Array<{
        collection: CollectionName;
        id: string;
        title?: string;
        about: string;
        url: string;
        score: number;
    }> = [];

    for (const r of json.results ?? []) {
        const collectionName =
            (r.request_params?.collection_name as CollectionName) ||
            (r.search?.collection as CollectionName) ||
            undefined;

        if (!collectionName) continue;

        for (const h of r.hits ?? []) {
            const doc = h.document ?? {};
            const id = String(doc.id ?? "");
            if (!id) continue;

            const title = doc.name || doc.title?.title || doc.title || doc.user?.name || doc.organization?.name || undefined;

            const snippet = bestSnippet(h);
            const about = String(snippet || doc.description || doc.title?.title || doc.title || doc.name || "").slice(0, 800);

            const orgSubdomain = doc.subdomain || doc.organization?.subdomain || undefined;
            const url = publicItemUrl(collectionName, { ...doc, __orgSubdomain: orgSubdomain });

            out.push({
                collection: collectionName,
                id,
                title,
                about,
                url,
                score: Number(h.text_match ?? 0),
            });
        }
    }

    out.sort((a, b) => b.score - a.score);
    return out.slice(0, 60);
}

const LINK_RULES = `
Linking rules (must follow):
- If you reference any item from Comend, you MUST include its "Where to view:" link.
- Never invent urls. Use ONLY urls present in the provided Comend context.
`;

const OUTPUT_FORMAT_RULES = `
Response format (must follow):

If Comend's data has relevant items:
1) Start with 2-6 sentences describing what Comend shows.
2) Then list the relevant Comend items. For each item, include:
   - Item: <title> (<collection>/<id>)
     Where to view: <url>
     About: <1-3 sentences grounded in Comend data>
     
If Comend data has a "kind" that is a count:
- Respond with 1-2 sentences stating the count.
- If an organization is involved, include its "Where to view" link when available.
- Do not list unrelated items.

If Comend data has no relevant items:
Respond ONLY with:
"I don’t know from Comend data."
Then add ONE line:
"Try searching on Comend for: <3-5 better queries>"
Do NOT provide general knowledge.
`;

function buildContextBlockJson(payload: unknown) {
    return `Comend data (the ONLY factual source):\n${JSON.stringify(payload, null, 2)}`;
}

export async function POST(req: Request) {
    const body = (await req.json()) as ChatBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const personaSystem = body.personaSystem ?? "You are a helpful assistant.";

    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const intent = detectIntent(lastUser, body);

    let contextPayload: any = null;

    if (intent.kind === "count_research_plans_for_org") {
        // Step 1: find orgId
        let orgId = intent.orgId ?? null;

        if (!orgId) {
            const rewritten = await rewriteForTypesense(lastUser);

            // Prefer extracted orgName, else rewritten.q, else raw user text
            const orgQuery =
                rewritten.entity?.orgName?.trim() ||
                rewritten.q?.trim() ||
                lastUser.trim();

            const resolved = await resolveOrgFromQuery(orgQuery);
            orgId = resolved?.orgId ?? null;

            if (!orgId) {
                contextPayload = {
                    kind: "count_research_plans_for_org",
                    error: "org_not_found",
                    orgQuery,
                    rewritten,
                };
            } else {
                const count = await countResearchPlansForOrg(orgId);
                contextPayload = {
                    kind: "count_research_plans_for_org",
                    orgId,
                    org: resolved,
                    count,
                };
            }
        }
    } else if (intent.kind === "count_orgs") {
        const count = await getOrganizationsCountNoAdmin();
        contextPayload = { kind: "count_orgs", count };
    } else if (intent.kind === "list_orgs") {
        const list = await listOrganizations({ page: intent.page, perPage: intent.perPage });
        contextPayload = { kind: "list_orgs", ...list };
    } else {
        const rewritten = await rewriteForTypesense(lastUser);
        const results = await typesenseMultiSearch({ q: rewritten.q });
        contextPayload = { kind: "search", q: rewritten.q, rewritten, results };
    }

    const context = buildContextBlockJson(contextPayload);

    const input = [
        { role: "system" as const, content: personaSystem },
        { role: "system" as const, content: LINK_RULES },
        { role: "system" as const, content: OUTPUT_FORMAT_RULES },
        { role: "system" as const, content: context },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const response = await openai.responses.create({
        model: "gpt-5-nano",
        input,
    });

    return NextResponse.json({
        text: response.output_text,
        debug: process.env.NODE_ENV === "development" ? { intent, contextPayload } : undefined,
    });
}
