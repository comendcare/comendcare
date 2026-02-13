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
    "http://localhost:3000";

const url = new URL(BASE_URL);

const PUBLIC_PROTOCOL = url.protocol.replace(":", "");
const PUBLIC_HOST = url.host;

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
    q: string; // the query string for Typesense
    intent?: "count" | "list" | "search";
    entity?: { orgName?: string }; // extracted org name if any
    targetCollections?: CollectionName[]; // optional narrowing
};

function sanitizeTypesenseQ(q: string) {
    return (q ?? "").replace(/\s+/g, " ").trim().slice(0, 200); // keep it short
}

async function rewriteForTypesense(userText: string): Promise<Rewritten> {
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
            .replace(
                /\b(how|many|does|do|have|show|list|tell|me|please|what|is|are|the|a|an)\b/gi,
                " "
            )
            .replace(/\s+/g, " ")
            .trim();
        return {
            q: sanitizeTypesenseQ(fallback) || sanitizeTypesenseQ(userText),
            intent: "search",
        };
    }
}

/**
 * NEW: Extract an organization query string (or null) from the user’s text.
 * This keeps org resolution from getting polluted by “research plans”, etc.
 */
async function extractOrgQuery(userText: string): Promise<string | null> {
    const prompt = `
You extract a likely organization name (or alias) from a user question, to search an organizations index.

Rules:
- Output MUST be valid JSON only (no markdown).
- Return: {"orgQuery": string|null}
- If the question includes an org name, return it as it appears (preserve casing/spelling).
- If the question contains only an acronym or gene symbol that could be an org (e.g. "STXBP1"), return that token.
- If you cannot identify any likely org token/name, return null.
- Keep it SHORT (1-8 words typically). Do not include generic words like "research plans", "count", "how many".

User text:
${JSON.stringify(userText)}
`;

    const r = await openai.responses.create({
        model: "gpt-5-nano",
        input: [{ role: "system", content: prompt }],
    });

    const raw = r.output_text?.trim() ?? "";
    try {
        const parsed = JSON.parse(raw) as { orgQuery: string | null };
        const oq = parsed?.orgQuery;
        if (!oq) return null;
        const cleaned = sanitizeTypesenseQ(String(oq));
        return cleaned || null;
    } catch {
        return null;
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

function bestSnippet(hit: MultiSearchHit): string | undefined {
    const hs = hit.highlights ?? [];
    const first = hs.find((h) => h.snippet)?.snippet;
    if (first) return first;
    const firstFromSnippets = hs.find(
        (h) => Array.isArray(h.snippets) && h.snippets.length
    )?.snippets?.[0];
    return firstFromSnippets;
}

function getTypesenseConfig() {
    const TYPESENSE_NODE = process.env.NEXT_PUBLIC_TYPESENSE_NODE;
    const searchKey = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY;

    if (!TYPESENSE_NODE) throw new Error("Missing env NEXT_PUBLIC_TYPESENSE_NODE");
    if (!searchKey)
        throw new Error("Missing env NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY");

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
    | { kind: "normal_search"; q: string };

function detectIntent(userText: string, body: ChatBody): Intent {
    const q = (userText ?? "").trim();
    const lower = q.toLowerCase();

    if (
        /\bhow many\b/.test(lower) &&
        (/\borgs?\b/.test(lower) || /\borganizations?\b/.test(lower))
    ) {
        return { kind: "count_orgs" };
    }

    if (
        (/\b(list|show|all)\b/.test(lower) &&
            (/\borgs?\b/.test(lower) || /\borganizations?\b/.test(lower))) ||
        lower === "organizations" ||
        lower === "orgs"
    ) {
        const page =
            Number.isFinite(body.page) && (body.page as number) > 0
                ? (body.page as number)
                : 1;
        const perPageRaw =
            Number.isFinite(body.perPage) && (body.perPage as number) > 0
                ? (body.perPage as number)
                : 25;
        const perPage = Math.max(1, Math.min(perPageRaw, 100));
        return { kind: "list_orgs", page, perPage };
    }

    return { kind: "normal_search", q };
}

/**
 * Dedicated organizations search (Typesense), used to resolve the org for DB fetching.
 */
async function searchOrganizations(opts: { q: string; perPage?: number }) {
    const { TYPESENSE_URL, searchKey } = getTypesenseConfig();

    const q = (opts.q ?? "").trim();
    if (!q) return [];

    const url = new URL(`${TYPESENSE_URL}/collections/organizations/documents/search`);
    url.searchParams.set("q", q);
    url.searchParams.set("query_by", "name,description");
    url.searchParams.set("per_page", String(opts.perPage ?? 10));

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
        throw new Error(
            `Typesense organizations search failed: ${res.status} ${text}`
        );
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

/**
 * Small suffix-expansion to catch “STXBP1” -> “STXBP1 Foundation”, etc.
 */
function candidateOrgQueries(raw: string) {
    const base = (raw ?? "").trim();
    if (!base) return [];

    const suffixes = [
        "",
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

async function resolveOrgFromUserText(userText: string) {
    // If the model can extract an org-ish token, use it; else fall back to rewritten entity.orgName if available.
    const extracted = await extractOrgQuery(userText);
    const rewritten = extracted ? null : await rewriteForTypesense(userText);
    const base =
        extracted ||
        rewritten?.entity?.orgName?.trim() ||
        null;

    const candidates = base ? candidateOrgQueries(base) : [];
    if (!candidates.length) return { resolved: null as null, debug: { extracted, rewritten } };

    let best:
        | { orgId: string; orgUrl: string; orgTitle: string; score: number }
        | null = null;

    for (const q of candidates) {
        const hits = await searchOrganizations({ q, perPage: 10 });
        if (!hits.length) continue;

        hits.sort((a, b) => b.score - a.score);
        const top = hits[0];

        const candidate = {
            orgId: top.id,
            orgUrl: top.url,
            orgTitle: top.title,
            score: top.score,
        };

        if (!best || candidate.score > best.score) best = candidate;

        // Early exit on strong Typesense match
        if (top.score >= 8000) break;
    }

    if (!best) return { resolved: null as null, debug: { extracted, rewritten } };
    return {
        resolved: { orgId: best.orgId, orgUrl: best.orgUrl, orgTitle: best.orgTitle },
        debug: { extracted, rewritten, candidatesTried: candidates },
    };
}

/**
 * Fetch “ALL the organization data and related models” (public-only) for the resolved org.
 * Respects:
 * - Organization.public + Organization.published
 * - Related models with `private` flags -> only `private: false`
 * - Roadmap published flag -> `published: true` + `private: false`
 */
async function fetchOrganizationBundle(orgId: string) {
    const org = await prisma.organization.findFirst({
        where: { id: orgId, public: true, published: true },
        include: {
            conditions: {
                include: {
                    condition: true,
                },
            },
        },
    });

    if (!org) return null;

    const orgSubdomain = org.subdomain || undefined;
    const orgUrl = publicItemUrl("organizations", { ...org, __orgSubdomain: orgSubdomain });

    // “research plans” in your UI correspond to Roadmap
    const researchPlans = await prisma.roadmap.findMany({
        where: {
            organizationId: orgId,
            private: false,
            published: true,
        },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            published: true,
            private: true,
            modalities: true,
            stages: true,
            statuses: true,
            organizationId: true,
        },
    });

    const milestones = await prisma.milestone.findMany({
        where: {
            organizationId: orgId,
            private: false,
        },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            startDate: true,
            endDate: true,
            budget: true,
            private: true,
            roadmapId: true,
            organizationId: true,
            updatedAt: true,
            createdAt: true,
        },
    });

    const tools = await prisma.tool.findMany({
        where: {
            organizationId: orgId,
            private: false,
        },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            description: true,
            private: true,
            pinned: true,
            genes: true,
            geneId: true,
            createdAt: true,
            updatedAt: true,
            organizationId: true,
        },
    });

    const biosamples = await prisma.biosample.findMany({
        where: {
            organizationId: orgId,
            private: false,
        },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            description: true,
            private: true,
            pinned: true,
            genes: true,
            geneId: true,
            variant: true,
            availability: true,
            quantity: true,
            quantityUnit: true,
            price: true,
            priceUnit: true,
            createdAt: true,
            updatedAt: true,
            organizationId: true,
        },
    });

    const diseaseModels = await prisma.diseaseModel.findMany({
        where: {
            organizationId: orgId,
            private: false,
        },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            description: true,
            private: true,
            pinned: true,
            genes: true,
            geneId: true,
            genotype: true,
            strain: true,
            createdAt: true,
            updatedAt: true,
            organizationId: true,
            conditionId: true,
        },
    });

    const rfps = await prisma.rFP.findMany({
        where: {
            organizationId: orgId,
            private: false,
        },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            description: true,
            eligibility: true,
            instructions: true,
            evaluationProcess: true,
            openTo: true,
            startDate: true,
            endDate: true,
            budget: true,
            private: true,
            pinned: true,
            createdAt: true,
            updatedAt: true,
            organizationId: true,
        },
    });

    // Add URLs consistently for the model to cite
    const researchPlansWithUrls = researchPlans.map((rp) => ({
        ...rp,
        url: publicItemUrl("research-plans", { ...rp, __orgSubdomain: orgSubdomain }),
    }));
    const milestonesWithUrls = milestones.map((m) => ({
        ...m,
        url: publicItemUrl("milestones", { ...m, __orgSubdomain: orgSubdomain }),
    }));
    const biosamplesWithUrls = biosamples.map((b) => ({
        ...b,
        url: publicItemUrl("biosamples", { ...b, __orgSubdomain: orgSubdomain }),
    }));
    const diseaseModelsWithUrls = diseaseModels.map((d) => ({
        ...d,
        url: publicItemUrl("disease-models", { ...d, __orgSubdomain: orgSubdomain }),
    }));
    const rfpsWithUrls = rfps.map((r) => ({
        ...r,
        url: publicItemUrl("rfps", { ...r, __orgSubdomain: orgSubdomain }),
    }));

    return {
        org: {
            id: org.id,
            name: org.name,
            description: org.description,
            website: org.website,
            subdomain: org.subdomain,
            public: org.public,
            published: org.published,
            verified: org.verified,
            url: orgUrl,
            conditions: (org.conditions ?? []).map((c) => ({
                id: c.id,
                conditionId: c.conditionId,
                conditionName: c.condition?.name ?? null,
                conditionSlug: c.condition?.slug ?? null,
            })),
        },
        researchPlans: researchPlansWithUrls,
        milestones: milestonesWithUrls,
        tools, // no public URL mapping defined in your publicItemUrl switch; keep raw
        biosamples: biosamplesWithUrls,
        diseaseModels: diseaseModelsWithUrls,
        rfps: rfpsWithUrls,
    };
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

            const title =
                doc.name ||
                doc.title?.title ||
                doc.title ||
                doc.user?.name ||
                doc.organization?.name ||
                undefined;

            const snippet = bestSnippet(h);
            const about = String(
                snippet || doc.description || doc.title?.title || doc.title || doc.name || ""
            ).slice(0, 800);

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

    if (intent.kind === "count_orgs") {
        const count = await getOrganizationsCountNoAdmin();
        contextPayload = { kind: "count_orgs", count };
    } else if (intent.kind === "list_orgs") {
        const list = await listOrganizations({ page: intent.page, perPage: intent.perPage });
        contextPayload = { kind: "list_orgs", ...list };
    } else {
        // NEW FLOW:
        // 1) Resolve org via Typesense (model-extracted org query + suffix expansion)
        // 2) Fetch org + related public data from DB
        // 3) Give the DB “datadump” to the model to answer
        //
        // Still supports old “search” behavior when no org can be resolved.
        let orgBundle: any = null;

        if (body.orgId) {
            orgBundle = await fetchOrganizationBundle(body.orgId);
            if (!orgBundle) {
                contextPayload = {
                    kind: "org_bundle",
                    error: "org_not_found_or_not_public",
                    orgId: body.orgId,
                };
            } else {
                contextPayload = {
                    kind: "org_bundle",
                    orgId: body.orgId,
                    org: orgBundle.org,
                    bundle: orgBundle,
                };
            }
        } else {
            const { resolved, debug } = await resolveOrgFromUserText(lastUser);

            if (resolved?.orgId) {
                orgBundle = await fetchOrganizationBundle(resolved.orgId);

                if (!orgBundle) {
                    contextPayload = {
                        kind: "org_bundle",
                        error: "org_not_found_or_not_public",
                        orgResolved: resolved,
                        debug,
                    };
                } else {
                    contextPayload = {
                        kind: "org_bundle",
                        orgId: resolved.orgId,
                        orgResolved: resolved,
                        org: orgBundle.org,
                        bundle: orgBundle,
                        debug: process.env.NODE_ENV === "development" ? debug : undefined,
                    };
                }
            } else {
                // Fallback to previous search behavior
                const rewritten = await rewriteForTypesense(lastUser);
                const results = await typesenseMultiSearch({ q: rewritten.q });
                contextPayload = { kind: "search", q: rewritten.q, rewritten, results, debug };
            }
        }
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
