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
    q: string; // query string for Typesense
    intent?: "count" | "list" | "search";
    entity?: { orgName?: string };
    targetCollections?: CollectionName[];
};

function sanitizeTypesenseQ(q: string) {
    return (q ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
}

async function rewriteForTypesense(userText: string): Promise<Rewritten> {
    const prompt = `
You rewrite user questions into a Typesense-searchable query string.

Rules:
- Output MUST be valid JSON only (no markdown).
- "q" MUST be a short string of 2-12 keywords / phrases.
- Remove filler words like: how, many, does, have, show, list, tell me, please.
- Keep proper nouns, acronyms, and disease/org names intact.
- Do NOT invent ids, filters, or facts.

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
        const fallback = userText
            .replace(/[?.,!]/g, " ")
            .replace(
                /\b(how|many|does|do|have|show|list|tell|me|please|what|is|are|the|a|an|on|in|at|to|for)\b/gi,
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
 * Always run Typesense multi_search across collections.
 * (No intent detection; no special casing.)
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
            query_by:
                "id,title.title,description,organization.name,institution.name,gene.symbol,type.label,condition.name",
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
        tsDoc?: any;
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
                tsDoc: undefined,
            });
        }
    }

    out.sort((a, b) => b.score - a.score);
    return out.slice(0, 60);
}

/**
 * DB enrichment (public-only). This is the “datadump” you feed the model.
 */
async function enrichFromDb(hits: Array<{ collection: CollectionName; id: string }>) {
    const byCollection = new Map<CollectionName, string[]>();
    for (const h of hits) {
        const arr = byCollection.get(h.collection) ?? [];
        arr.push(h.id);
        byCollection.set(h.collection, arr);
    }

    const uniq = (xs: string[]) => Array.from(new Set(xs));

    const organizationsIds = uniq(byCollection.get("organizations") ?? []);
    const milestonesIds = uniq(byCollection.get("milestones") ?? []);
    const biosamplesIds = uniq(byCollection.get("biosamples") ?? []);
    const diseaseModelsIds = uniq(byCollection.get("disease-models") ?? []);
    const rfpsIds = uniq(byCollection.get("rfps") ?? []);
    const researchPlansIds = uniq(byCollection.get("research-plans") ?? []);
    const companiesIds = uniq(byCollection.get("companies") ?? []);
    const researchersIds = uniq(byCollection.get("researchers") ?? []);

    const [
        organizations,
        milestones,
        biosamples,
        diseaseModels,
        rfps,
        roadmaps,
        companies,
        researchers,
    ] = await Promise.all([
        organizationsIds.length
            ? prisma.organization.findMany({
                where: { id: { in: organizationsIds }, public: true, published: true },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    website: true,
                    subdomain: true,
                    customDomain: true,
                    public: true,
                    published: true,
                    verified: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
            : Promise.resolve([]),
        milestonesIds.length
            ? prisma.milestone.findMany({
                where: { id: { in: milestonesIds }, private: false },
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
                    createdAt: true,
                    updatedAt: true,
                },
            })
            : Promise.resolve([]),
        biosamplesIds.length
            ? prisma.biosample.findMany({
                where: { id: { in: biosamplesIds }, private: false },
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
                    organizationId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
            : Promise.resolve([]),
        diseaseModelsIds.length
            ? prisma.diseaseModel.findMany({
                where: { id: { in: diseaseModelsIds }, private: false },
                select: {
                    id: true,
                    description: true,
                    private: true,
                    pinned: true,
                    genes: true,
                    geneId: true,
                    genotype: true,
                    strain: true,
                    conditionId: true,
                    organizationId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
            : Promise.resolve([]),
        rfpsIds.length
            ? prisma.rFP.findMany({
                where: { id: { in: rfpsIds }, private: false },
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
                    organizationId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
            : Promise.resolve([]),
        researchPlansIds.length
            ? prisma.roadmap.findMany({
                where: { id: { in: researchPlansIds }, private: false, published: true },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    description: true,
                    private: true,
                    published: true,
                    modalities: true,
                    stages: true,
                    statuses: true,
                    organizationId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
            : Promise.resolve([]),
        companiesIds.length
            ? prisma.company.findMany({
                where: { id: { in: companiesIds } },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    website: true,
                    headquarters: true,
                    companyType: true,
                    categories: true,
                    tags: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
            : Promise.resolve([]),
        researchersIds.length
            ? prisma.researcher.findMany({
                where: { id: { in: researchersIds } },
                select: {
                    id: true,
                    website: true,
                    description: true,
                    country: true,
                    title: true,
                    groupName: true,
                    researchInterests: true,
                    therapeuticsOfInterest: true,
                    conditionsOfInterest: true,
                    genesOfInterest: true,
                    createdAt: true,
                    updatedAt: true,
                    user: { select: { name: true } },
                },
            })
            : Promise.resolve([]),
    ]);

    const orgIdsFromChildren = uniq(
        [
            ...milestones.map((m: any) => m.organizationId).filter(Boolean),
            ...biosamples.map((b: any) => b.organizationId).filter(Boolean),
            ...diseaseModels.map((d: any) => d.organizationId).filter(Boolean),
            ...rfps.map((r: any) => r.organizationId).filter(Boolean),
            ...roadmaps.map((rp: any) => rp.organizationId).filter(Boolean),
        ].map(String)
    );

    const orgLookupRows = orgIdsFromChildren.length
        ? await prisma.organization.findMany({
            where: { id: { in: orgIdsFromChildren }, public: true, published: true },
            select: { id: true, subdomain: true, name: true },
        })
        : [];

    const orgById = new Map<string, { id: string; subdomain: string | null; name: string | null }>();
    for (const o of orgLookupRows) orgById.set(o.id, o);

    const orgDocsById = new Map(organizations.map((o: any) => [o.id, o] as const));
    const milestoneById = new Map(milestones.map((m: any) => [m.id, m] as const));
    const biosampleById = new Map(biosamples.map((b: any) => [b.id, b] as const));
    const diseaseModelById = new Map(diseaseModels.map((d: any) => [d.id, d] as const));
    const rfpById = new Map(rfps.map((r: any) => [r.id, r] as const));
    const roadmapById = new Map(roadmaps.map((r: any) => [r.id, r] as const));
    const companyById = new Map(companies.map((c: any) => [c.id, c] as const));
    const researcherById = new Map(researchers.map((r: any) => [r.id, r] as const));

    function attachUrlForChild(collection: CollectionName, doc: any) {
        const orgId = String(doc?.organizationId ?? "");
        const org = orgById.get(orgId);
        const __orgSubdomain = org?.subdomain || undefined;
        return {
            ...doc,
            __orgSubdomain,
            url: publicItemUrl(collection, { ...doc, __orgSubdomain }),
        };
    }

    return {
        organizations: Array.from(orgDocsById.values()).map((o: any) => ({
            ...o,
            url: publicItemUrl("organizations", { ...o, __orgSubdomain: o.subdomain || undefined }),
        })),
        milestones: Array.from(milestoneById.values()).map((m: any) => attachUrlForChild("milestones", m)),
        biosamples: Array.from(biosampleById.values()).map((b: any) => attachUrlForChild("biosamples", b)),
        diseaseModels: Array.from(diseaseModelById.values()).map((d: any) => attachUrlForChild("disease-models", d)),
        rfps: Array.from(rfpById.values()).map((r: any) => attachUrlForChild("rfps", r)),
        researchPlans: Array.from(roadmapById.values()).map((rp: any) => attachUrlForChild("research-plans", rp)),
        companies: Array.from(companyById.values()).map((c: any) => ({
            ...c,
            url: publicItemUrl("companies", { ...c }),
        })),
        researchers: Array.from(researcherById.values()).map((r: any) => ({
            ...r,
            name: r.user?.name ?? null,
            url: publicItemUrl("researchers", { id: r.id }),
        })),
        clinicalDatasets: [],
    };
}

// -----------------------------
// NEW: deterministic link repair
// -----------------------------
type ItemKey = `${CollectionName}/${string}`;

function buildUrlIndex(contextPayload: any) {
    const map = new Map<ItemKey, string>();

    // From Typesense results
    for (const r of contextPayload.typesenseResults ?? []) {
        if (r?.collection && r?.id && r?.url) {
            map.set(`${r.collection}/${String(r.id)}` as ItemKey, String(r.url));
        }
    }

    // From DB enrichment (preferred)
    const e = contextPayload.dbEnrichment ?? {};
    const pushArr = (collection: CollectionName, arr: any[]) => {
        for (const d of arr ?? []) {
            if (d?.id && d?.url) {
                map.set(`${collection}/${String(d.id)}` as ItemKey, String(d.url));
            }
        }
    };

    pushArr("organizations", e.organizations);
    pushArr("milestones", e.milestones);
    pushArr("biosamples", e.biosamples);
    pushArr("disease-models", e.diseaseModels);
    pushArr("rfps", e.rfps);
    pushArr("research-plans", e.researchPlans);
    pushArr("companies", e.companies);
    pushArr("researchers", e.researchers);
    // clinical-datasets: no enrichment here, so Typesense-only already covered

    return map;
}

function ensureWhereToViewLinks(text: string, urlIndex: Map<string, string>) {
    const lines = String(text ?? "").split("\n");
    const out: string[] = [];

    // Matches exactly your required item line:
    // - Item: <title> (<collection>/<id>)
    const itemLineRe = /^\s*-\s*Item:\s*(.+)\s+\(([^)]+)\)\s*$/;
    const whereLineRe = /^\s*Where to view:\s*(\S+)\s*$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        out.push(line);

        const m = line.match(itemLineRe);
        if (!m) continue;

        const key = m[2].trim(); // "collection/id"
        const url = urlIndex.get(key);
        if (!url) continue; // never invent

        // Look ahead to next non-empty line; if it is already Where to view, skip
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j++;

        if (j < lines.length && whereLineRe.test(lines[j])) continue;

        out.push(`  Where to view: ${url}`);
    }

    return out.join("\n");
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
     
If you can answer with a count:
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

    const rewritten = await rewriteForTypesense(lastUser);
    const tsResults = await typesenseMultiSearch({ q: rewritten.q });

    const topForEnrichment = tsResults.slice(0, 25).map((r) => ({ collection: r.collection, id: r.id }));
    const enrichment = await enrichFromDb(topForEnrichment);

    const contextPayload = {
        kind: "enriched_search",
        q: rewritten.q,
        rewritten,
        typesenseResults: tsResults,
        dbEnrichment: enrichment,
        note: "DB enrichment is filtered to public/published orgs and non-private related records.",
    };

    const context = buildContextBlockJson(contextPayload);

    const input = [
        { role: "system" as const, content: personaSystem },
        { role: "system" as const, content: LINK_RULES },
        { role: "system" as const, content: OUTPUT_FORMAT_RULES },
        { role: "system" as const, content: context },
        ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        })),
    ];

    const response = await openai.responses.create({
        model: "gpt-5-nano",
        input,
    });

    // ✅ NEW: enforce Where to view links deterministically
    const urlIndex = buildUrlIndex(contextPayload);
    const rawText = response.output_text ?? "";
    const repairedText = ensureWhereToViewLinks(rawText, urlIndex);

    return NextResponse.json({
        text: repairedText,
        debug: process.env.NODE_ENV === "development" ? { contextPayload } : undefined,
    });
}
