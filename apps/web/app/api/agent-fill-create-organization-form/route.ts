// app/api/agent-fill-create-organization-form/route.ts
import OpenAI from "openai";
import { z } from "zod";
import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@comend/lib/auth";
import { MOLECULAR_MECHANISMS } from "@comend/lib/types";

const mechanismOptionByValue = new Map(
    MOLECULAR_MECHANISMS.map((m) => [m.value, m])
);

// -----------------------------
// API-safe enums (match your existing ones)
// -----------------------------
const TherapeuticsEnum = z.enum([
    "Gene replacement therapy",
    "Drug screening or repurposing",
    "Antisense oligonucleotide (ASO)",
    "Therapeutic-agnostic tool development",
    "Enzyme or protein replacement",
    "Small molecule",
    "Gene editing",
    "Other RNA therapy",
    "Cell therapies",
    "Disease characterization",
    "Basic science",
    "Supplements",
    "Antibody therapy",
    "Vaccine",
    "Medical device",
    "Other",
]);

const capitalize = (s: string) =>
    s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const MechanismEnum = z.enum([
    "LOSS_OF_FUNCTION",
    "GAIN_OF_FUNCTION",
    "HAPLOINSUFFICIENCY",
    "CHROMOSOMAL_ABERRATION",
    "UNKNOWN",
    "OTHER",
]);

// -----------------------------
// New: output shape meant to prefill *your form* (NO research plans)
// -----------------------------
const FormFillOutSchema = z.object({
    // ORG
    name: z.string().nullable(),
    description: z.string().nullable(),
    contactEmail: z.string().nullable(), // validate later
    website: z.string(), // canonical website (validate later)
    logo: z.string().nullable(), // validate later
    image: z.string().nullable(), // validate later
    yearFounded: z.string().nullable(), // "YYYY" if present
    therapeuticsOfInterest: z.array(TherapeuticsEnum).default([]),
    therapeuticsInDevelopment: z.array(TherapeuticsEnum).default([]),

    // CONDITION (only fields you can use to fill your form)
    disorderName: z.string().nullable(), // -> form.disorder[0].label
    associatedConditionNames: z.array(z.string()).default([]),
    conditionSummary: z.string().nullable(), // -> form.summary
    mechanismsOfAction: z.array(MechanismEnum).default([]),
    causalGenes: z.array(z.string()).default([]), // -> form.causal (labels)
    associatedGenes: z.array(z.string()).default([]), // -> form.genes (labels)
    associatedSystems: z.array(z.string()).default([]), // -> form.systems (labels)
    symptoms: z.array(z.string()).default([]), // -> form.symptoms (labels)
});

type FormFillOut = z.infer<typeof FormFillOutSchema>;

const ScoutSchema = z.object({
    canonicalWebsite: z.string().nullable(),
    selectedUrls: z.array(z.string()).min(1).max(12),
    notes: z.string().nullable(),
});

// -----------------------------
// Sanitizers
// -----------------------------
function isHttpUrl(s: unknown): s is string {
    if (typeof s !== "string") return false;
    try {
        const u = new URL(s);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

function toHttpUrlOrNull(s: unknown): string | null {
    return isHttpUrl(s) ? s : null;
}

function toEmailOrNull(s: unknown): string | null {
    if (typeof s !== "string") return null;
    const t = s.trim();
    if (!t.includes("@") || t.length > 320) return null;
    return t;
}

function safeOrigin(u: string): string | null {
    try {
        return new URL(u).origin;
    } catch {
        return null;
    }
}

function uniqPreserve<T extends string>(arr: T[]) {
    const seen = new Set<T>();
    const out: T[] = [];
    for (const x of arr) {
        if (seen.has(x)) continue;
        seen.add(x);
        out.push(x);
    }
    return out;
}

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 63);
}

async function ensureUniqueSubdomain(base: string) {
    let s = base || "org";
    s = slugify(s) || "org";

    for (let i = 0; i < 50; i++) {
        const candidate = i === 0 ? s : `${s}-${i + 1}`;
        const exists = await prisma.organization.findUnique({ where: { subdomain: candidate } });
        if (!exists) return candidate;
    }
    return `${s}-${Math.random().toString(16).slice(2, 8)}`;
}

// -----------------------------
// HTML -> text (minimal; no external deps)
// -----------------------------
function stripHtmlToText(html: string) {
    const noScript = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ");
    const noStyle = noScript.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ");
    const text = noStyle
        .replace(/<\/(p|div|br|li|h1|h2|h3|h4|h5|h6)>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    return text;
}

async function fetchHtml(url: string, timeoutMs = 20_000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            signal: ctrl.signal,
            redirect: "follow",
            headers: {
                "user-agent":
                    "Mozilla/5.0 (compatible; OrgFormFiller/1.0; +https://example.invalid) AppleWebKit/537.36 Safari/537.36",
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
        });
        const ctype = res.headers.get("content-type") || "";
        if (!ctype.includes("text/html") && !ctype.includes("application/xhtml+xml")) {
            return { ok: false, status: res.status, html: "" };
        }
        const html = await res.text();
        return { ok: res.ok, status: res.status, html };
    } catch {
        return { ok: false, status: 0, html: "" };
    } finally {
        clearTimeout(t);
    }
}

// -----------------------------
// OpenAI (Responses API + Structured Outputs)
// -----------------------------
async function getZodTextFormat() {
    const mod = await import("openai/helpers/zod");
    return mod.zodTextFormat;
}

function scoutSystemPrompt() {
    return [
        "You are a web scout agent.",
        "Goal: identify the canonical organization website and pick the most relevant subpages to extract:",
        "- org identity (name, logo, contact email)",
        "- org description",
        "- (optional) condition information suitable for onboarding form (condition name, summary, symptoms, genes, systems, mechanisms)",
        "",
        "Use the web_search tool. Prefer primary sources (the organization website).",
        "Return ONLY JSON matching the schema.",
        "Do NOT include more than 12 URLs.",
    ].join("\n");
}

function scoutUserPrompt(inputUrl: string) {
    return [
        `Input URL: ${inputUrl}`,
        "",
        "Task:",
        "1) Find the canonical official website homepage (origin) for the organization.",
        "2) Choose the best URLs to visit (1–12) to extract org profile + condition onboarding information.",
        "",
        "Constraints:",
        "- Prefer the organization’s own domain(s).",
        "- Include at least: homepage + about/mission + contact + disease/condition + research/science pages if available.",
        "- Only include off-domain URLs if they are essential and clearly authoritative.",
        "",
        "Return JSON:",
        "{ canonicalWebsite: string|null, selectedUrls: string[], notes: string|null }",
    ].join("\n");
}

async function scout(openai: OpenAI, inputUrl: string) {
    const zodTextFormat = await getZodTextFormat();
    const resp = await openai.responses.parse({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        tools: [{ type: "web_search" }],
        input: [
            { role: "system", content: scoutSystemPrompt() },
            { role: "user", content: scoutUserPrompt(inputUrl) },
        ],
        text: { format: zodTextFormat(ScoutSchema, "scout") },
    });

    const raw = ScoutSchema.parse(resp.output_parsed);
    return {
        canonicalWebsite: toHttpUrlOrNull(raw.canonicalWebsite),
        selectedUrls: uniqPreserve(raw.selectedUrls.filter(isHttpUrl)).slice(0, 12),
        notes: raw.notes ?? null,
    };
}

function extractSystemPrompt() {
    return [
        "You are a strict information extractor for rare disease organizations and condition onboarding data.",
        "Use ONLY the provided page text and URLs. If a fact is not supported, use null or [] (never invent).",
        "Do not guess emails, addresses, dates, numbers, genes, or symptoms.",
        "Return ONLY JSON matching the schema.",
    ].join("\n");
}

function extractUserPrompt(canonicalWebsite: string, pagesBundle: string) {
    return [
        `Canonical website (website must be exactly this): ${canonicalWebsite}`,
        "",
        "Output must include ONLY org profile fields + condition onboarding fields for a signup form.",
        "Do NOT output research plans, pipelines, clinical stages, trials lists, or program details beyond what maps to the fields.",
        "",
        "Rules:",
        "- name must be the proper org/brand name (not slogans).",
        "- description: 2–4 sentences about the organization (not the disease).",
        "- yearFounded: 4-digit year only if explicitly stated.",
        `- therapeuticsOfInterest / therapeuticsInDevelopment must be chosen only from: ${JSON.stringify(
            TherapeuticsEnum.options
        )}`,
        "",
        "Condition field guidance:",
        "- disorderName: the primary disease/condition the org focuses on (official name) if explicitly stated, else null.",
        "- conditionSummary: 2–4 sentences describing the condition if explicitly stated, else null.",
        "- mechanismsOfAction must ONLY use one or more of the following values:",
        JSON.stringify([
            "LOSS_OF_FUNCTION",
            "GAIN_OF_FUNCTION",
            "HAPLOINSUFFICIENCY",
            "CHROMOSOMAL_ABERRATION",
            "UNKNOWN",
            "OTHER",
        ]),
        "- If the mechanism is unclear, use UNKNOWN.",
        "- causalGenes / associatedGenes: gene symbols only if explicitly stated, else [].",
        "- symptoms: short list of symptom labels if explicitly stated, else [].",
        "- associatedSystems: body systems if explicitly stated (e.g. 'neurologic', 'cardiac'), else [].",
        "",
        "Pages (text extracted from fetched URLs):",
        pagesBundle,
    ].join("\n");
}

async function extract(openai: OpenAI, canonicalWebsite: string, pagesBundle: string) {
    const zodTextFormat = await getZodTextFormat();
    const resp = await openai.responses.parse({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        input: [
            { role: "system", content: extractSystemPrompt() },
            { role: "user", content: extractUserPrompt(canonicalWebsite, pagesBundle) },
        ],
        text: { format: zodTextFormat(FormFillOutSchema, "form_fill_out") },
    });

    const raw = FormFillOutSchema.parse(resp.output_parsed);

    const cleaned: FormFillOut = {
        ...raw,
        website: canonicalWebsite,
        contactEmail: toEmailOrNull(raw.contactEmail),
        logo: toHttpUrlOrNull(raw.logo),
        image: toHttpUrlOrNull(raw.image),
        associatedConditionNames: uniqPreserve((raw.associatedConditionNames ?? []).filter(Boolean)).slice(0, 5),
        mechanismsOfAction: uniqPreserve((raw.mechanismsOfAction ?? []).filter(Boolean)).slice(0, 20),
        causalGenes: uniqPreserve((raw.causalGenes ?? []).filter(Boolean)).slice(0, 25),
        associatedGenes: uniqPreserve((raw.associatedGenes ?? []).filter(Boolean)).slice(0, 25),
        associatedSystems: uniqPreserve((raw.associatedSystems ?? []).filter(Boolean)).slice(0, 25),
        symptoms: uniqPreserve((raw.symptoms ?? []).filter(Boolean)).slice(0, 50),
    };

    return FormFillOutSchema.parse(cleaned);
}

async function fetchSelectedPages(selectedUrls: string[]) {
    const MAX_FETCH_PAGES = Number(process.env.MAX_FETCH_PAGES ?? 10);
    const MAX_PAGE_CHARS = Number(process.env.MAX_PAGE_CHARS ?? 45_000);
    const MAX_TOTAL_CHARS = Number(process.env.MAX_TOTAL_CHARS ?? 180_000);

    const urls = uniqPreserve(selectedUrls).slice(0, MAX_FETCH_PAGES);

    const pages: { url: string; text: string; status: number }[] = [];
    let total = 0;

    for (const u of urls) {
        const r = await fetchHtml(u);
        if (!r.ok || !r.html) continue;

        const text = stripHtmlToText(r.html).slice(0, MAX_PAGE_CHARS);
        if (text.length < 200) continue;

        const chunk = `URL: ${u}\nTEXT:\n${text}\n`;
        if (total + chunk.length > MAX_TOTAL_CHARS) break;

        pages.push({ url: u, text, status: r.status });
        total += chunk.length;
    }

    const bundle = pages.map((p) => `URL: ${p.url}\nTEXT:\n${p.text}\n`).join("\n---\n");
    return { pages, bundle };
}

// -----------------------------
// Route
// -----------------------------
const BodySchema = z.object({ url: z.string().min(1) });

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ success: false, error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success || !isHttpUrl(parsed.data.url)) {
        return NextResponse.json({ success: false, error: "Invalid URL" }, { status: 400 });
    }

    const inputUrl = parsed.data.url;

    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const s = await scout(openai, inputUrl);
        const canonical = s.canonicalWebsite ?? safeOrigin(inputUrl) ?? inputUrl;

        const fetched = await fetchSelectedPages(s.selectedUrls);
        const out = await extract(
            openai,
            canonical,
            fetched.bundle || `No readable page text fetched for: ${canonical}`
        );

        const name = (out.name || "").trim() || "";
        const suggestedSubdomain = name ? await ensureUniqueSubdomain(slugify(name)) : "";

        const opt = (label: string) => ({
            value: label,
            label: capitalize(label),
            description: "",
        });

        return NextResponse.json({
            success: true,
            values: {
                // ORG
                name: name || undefined,
                description: (out.description || "").trim() || undefined,
                website: out.website || undefined,
                contactEmail: out.contactEmail ?? undefined,
                founded: out.yearFounded ? `${out.yearFounded}-01-01` : undefined,
                subdomain: suggestedSubdomain || undefined,
                orgImage: out.image ?? out.logo ?? undefined,
                therapeuticsInDevelopment: (out.therapeuticsInDevelopment ?? []).map((x) => opt(x)),
                therapeuticsOfInterest: (out.therapeuticsOfInterest ?? []).map((x) => opt(x)),

                // CONDITION
                disorder: out.disorderName ? [opt(out.disorderName)] : undefined,
                associatedConditions: (out.associatedConditionNames ?? []).map((x) => opt(x)),
                summary: (out.conditionSummary || "").trim() || undefined,
                categories: (out.mechanismsOfAction ?? [])
                    .map((v) => mechanismOptionByValue.get(v))
                    .filter(Boolean),
                causal: (out.causalGenes ?? []).map((x) => opt(x)),
                genes: (out.associatedGenes ?? []).map((x) => opt(x)),
                systems: (out.associatedSystems ?? []).map((x) => opt(x)),
                symptoms: (out.symptoms ?? []).map((x) => opt(x)),

                // optional metadata for debugging (no research plan content)
                __agent: {
                    canonicalWebsite: canonical,
                    selectedUrls: s.selectedUrls,
                    fetchedPages: fetched.pages.length,
                    notes: s.notes ?? null,
                },
            },
        });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e?.message || "Failed to fill form" },
            { status: 500 }
        );
    }
}
