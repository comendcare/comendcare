// app/api/chat/route.ts
import OpenAI from "openai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Message = { role: "user" | "assistant"; content: string };

type ChatBody = {
    messages: Message[];
    personaSystem: string; // from your UI persona.system
    orgId?: string | null; // future: pass org scope
};

export type CollectionName =
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
// IMPORTANT: make this a HOST (no protocol). ex: "localhost:3000" or "comend.com"
const PUBLIC_HOST =
    (process.env.NEXT_PUBLIC_APP_HOST ||
        process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ||
        "localhost:3000") as string;

// IMPORTANT: "http" in dev, "https" in prod
const PUBLIC_PROTOCOL =
    (process.env.NEXT_PUBLIC_APP_PROTOCOL ||
        (PUBLIC_HOST.includes("localhost") ? "http" : "https")) as string;

function hostForOrg(orgSubdomain?: string) {
    return orgSubdomain ? `${orgSubdomain}.${PUBLIC_HOST}` : PUBLIC_HOST;
}
function absoluteUrl(path: string, orgSubdomain?: string) {
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${PUBLIC_PROTOCOL}://${hostForOrg(orgSubdomain)}${p}`;
}

const LINK_RULES = `
Linking rules (must follow):
- If you reference any item from Comend, you MUST include its "Where to view:" link.
- Never invent urls. Use ONLY the urls that appear in Comend's data.
`;

const OUTPUT_FORMAT_RULES = `
Response format (must follow):

If Comend's data has relevant items:
1) Start with 2-6 sentences describing what Comend shows.
2) Then list the relevant Comend items. For each item, include:
   - Item: <title> (<collection>/<id>)
     Where to view: <url>
     What it says: <1-3 sentences grounded in Comend data>

If Comend data has no relevant items:
Respond ONLY with:
"I don’t know from Comend data."
Then add ONE line:
"Try searching on Comend for: <3-5 better queries>"
Do NOT provide general knowledge.
`;

// lib/urls/publicUrls.ts (kept same name)
export function publicItemUrl(collection: CollectionName, doc: any) {
    const id = String(doc?.id ?? "");
    const slug = String(doc?.slug ?? "");
    const orgSubdomain =
        doc?.__orgSubdomain ||
        doc?.subdomain ||
        doc?.organization?.subdomain ||
        doc?.organizationSubdomain ||
        undefined;

    // If your entire app is subdomain-scoped, keep orgSubdomain in all these.
    // If some routes are root-domain scoped, drop orgSubdomain for those.
    switch (collection) {
        case "organizations":
            // If org homepage is just the subdomain root:
            return absoluteUrl("/", orgSubdomain);
        // If your org page is /org/:slug:
        // return absoluteUrl(`/org/${slug || id}`, orgSubdomain);

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
            // only if you actually have a public milestone page
            return absoluteUrl(`/milestone/${id}`, orgSubdomain);

        default:
            return absoluteUrl("/", orgSubdomain);
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
    const firstFromSnippets = hs.find((h) => Array.isArray(h.snippets) && h.snippets.length)?.snippets?.[0];
    return firstFromSnippets;
}

async function typesenseSearch(opts: { q: string; orgId?: string | null }) {
    const TYPESENSE_NODE = process.env.NEXT_PUBLIC_TYPESENSE_NODE;
    const key = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY;

    if (!TYPESENSE_NODE) throw new Error("Missing env NEXT_PUBLIC_TYPESENSE_NODE");
    if (!key) throw new Error("Missing env NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY");

    const TYPESENSE_URL = `https://${TYPESENSE_NODE}`.replace(/\/$/, "");

    const q = (opts.q ?? "").trim();
    if (!q) return [];

    // KEEP YOUR ORIGINAL query_by (known-good schema), just add fuzz/prefix params.
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
            per_page: 6,

            // ===== make non-exact matching work =====
            prefix: true,
            exhaustive_search: true,
            num_typos: 2,
            typo_tokens_threshold: 1,

            // ===== helpful ranking knobs =====
            // prioritize_exact_match is supported in Typesense search; it’s safe to send.
            prioritize_exact_match: true,

            // highlights help the model say “What it says”
            highlight_full_fields: s.query_by,
        })),
    };

    const res = await fetch(`${TYPESENSE_URL}/multi_search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-TYPESENSE-API-KEY": key,
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    if (!res.ok) {
        // DO NOT silently return [] — that makes debugging impossible.
        const text = await res.text();
        throw new Error(`Typesense multi_search failed: ${res.status} ${text}`);
    }

    const json = (await res.json()) as { results?: MultiSearchResult[] };

    const out: Array<{
        collection: CollectionName;
        id: string;
        title?: string;
        text: string;
        url: string;
        score: number;
    }> = [];

    for (const r of json.results ?? []) {
        // FIX: in multi_search, collection name is here:
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

            // prefer snippet/highlights rather than dumping JSON
            const snippet = bestSnippet(h);
            const text =
                snippet ||
                doc.description ||
                doc.title?.title ||
                doc.title ||
                doc.name ||
                JSON.stringify(doc);

            // subdomain extraction (must exist in indexed doc; no guessing)
            const orgSubdomain =
                doc.subdomain ||
                doc.organization?.subdomain ||
                undefined;

            const url = publicItemUrl(collectionName, {
                ...doc,
                __orgSubdomain: orgSubdomain,
            });

            out.push({
                collection: collectionName,
                id,
                title,
                text: String(text).slice(0, 800),
                url,
                score: Number(h.text_match ?? 0),
            });
        }
    }

    out.sort((a, b) => b.score - a.score);
    return out.slice(0, 20);
}

function buildContextBlock(
    results: Array<{ collection: string; id: string; title?: string; text: string; url: string }>
) {
    if (!results.length) return "Comend data: (no results)";

    return [
        "Comend data (the ONLY factual source):",
        "",
        ...results.map((r, i) =>
            [
                `[#${i + 1}] Item: ${r.title ?? "(untitled)"} (${r.collection}/${r.id})`,
                `Where to view: ${r.url}`,
                `Summary: ${r.text}`,
            ].join("\n")
        ),
    ].join("\n\n");
}

export async function POST(req: Request) {
    const body = (await req.json()) as ChatBody;
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const personaSystem = body.personaSystem ?? "You are a helpful assistant.";

    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    const tsResults = await typesenseSearch({ q: lastUser, orgId: body.orgId ?? null });
    const context = buildContextBlock(tsResults);

    const input = [
        { role: "system" as const, content: personaSystem },
        { role: "system" as const, content: LINK_RULES },
        { role: "system" as const, content: OUTPUT_FORMAT_RULES },
        { role: "system" as const, content: context },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const response = await openai.responses.create({
        model: "gpt-5",
        input,
    });

    return NextResponse.json({ text: response.output_text });
}
