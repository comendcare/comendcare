// app/api/agent-create-organization/route.ts
import OpenAI from "openai";
import { z } from "zod";
import { NextResponse } from "next/server";
import prisma from "@comend/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@comend/lib/auth";
import type { JsonObject } from "@prisma/client/runtime/library";

// -----------------------------
// API-safe schemas (NO .url() / .email())
// -----------------------------
const TherapeuticsEnum = z.enum([
    "GENE_THERAPY_AAV",
    "GENE_THERAPY",
    "GENE_EDITING",
    "ANTISENSE_OLIGONUCLEOTIDE",
    "OTHER_RNA_THERAPY",
    "ENZYME_REPLACEMENT",
    "ANTIBODIES",
    "NOVEL_CHEMISTRY",
    "VACCINE",
    "STEM_CELL_TRANSPLANT",
    "DRUG_REPURPOSING",
    "SMALL_MOLECULE",
    "OTHER",
]);

const ResearchStageEnum = z.enum([
    "DISCOVERY",
    "PRECLINICAL",
    "IND_APPROVED",
    "EXPANDED_ACCESS",
    "PHASE_1_2",
    "PHASE_1",
    "PHASE_2",
    "PHASE_3",
    "FDA_APPROVED",
]);

const ResearchStatusEnum = z.enum(["ONGOING", "PAUSED_OR_SHELVED", "FAILED", "SEEKING_PARTNERS"]);

const TherapeuticStrategyEnum = z.enum([
    "GENE_THERAPY",
    "DRUG_REPURPOSING",
    "ANTISENSE_OLIGONUCLEOTIDE",
    "GENE_EDITING",
    "OTHER_RNA_THERAPY",
    "NOVEL_CHEMISTRY",
    "STEM_CELL_TRANSPLANT",
    "ENZYME_REPLACEMENT",
    "ANTIBODIES",
]);

const ResearchPlanSchema = z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
    modalities: z.array(z.string()).default([]),
    therapeuticStrategy: TherapeuticStrategyEnum.nullable(),
    therapeuticStrategySubtypes: z.array(z.string()).default([]),
    partners: z.array(z.string()).default([]),
    stage: ResearchStageEnum.nullable(),
    status: ResearchStatusEnum.nullable(),
    linkToMoreInfo: z.string().nullable(), // validate later
});

const OrgOutSchema = z.object({
    name: z.string().nullable(),
    description: z.string().nullable(),
    contactEmail: z.string().nullable(), // validate later
    website: z.string(), // validate later
    logo: z.string().nullable(), // validate later
    image: z.string().nullable(), // validate later
    yearFounded: z.string().nullable(),
    therapeuticsOfInterest: z.array(TherapeuticsEnum).default([]),
    therapeuticsInDevelopment: z.array(TherapeuticsEnum).default([]),
    clinicalStage: z.boolean(),
    researchPlans: z.array(ResearchPlanSchema).default([]),
});

type OrgOut = z.infer<typeof OrgOutSchema>;

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

function uniqPreserve(arr: string[]) {
    const seen = new Set<string>();
    const out: string[] = [];
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
    // quick sanitize
    s = slugify(s) || "org";

    // try base, then base-2, base-3...
    for (let i = 0; i < 50; i++) {
        const candidate = i === 0 ? s : `${s}-${i + 1}`;
        const exists = await prisma.organization.findUnique({ where: { subdomain: candidate } });
        if (!exists) return candidate;
    }
    // fallback random
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
                    "Mozilla/5.0 (compatible; OrgExtractor/1.0; +https://example.invalid) AppleWebKit/537.36 Safari/537.36",
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
        "- therapeutic/research programs (pipeline/programs/research/clinical trials)",
        "- evidence of clinical stage (IND, Phases, GMP/CMC, GLP tox, etc.)",
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
        "2) Choose the best URLs to visit (1–12) to extract org profile + research plans.",
        "",
        "Constraints:",
        "- Prefer the organization’s own domain(s).",
        "- Include at least: homepage + about/mission + contact + research/pipeline/programs pages if available.",
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
        "You are a strict information extractor for rare disease organizations and therapeutic/research programs.",
        "Use ONLY the provided page text and URLs. If a fact is not supported, use null or [] (never invent).",
        "Do not guess emails, addresses, dates, numbers, or partners.",
        "Return ONLY JSON matching the schema.",
    ].join("\n");
}

function extractUserPrompt(canonicalWebsite: string, pagesBundle: string) {
    return [
        `Canonical website (org.website must be exactly this): ${canonicalWebsite}`,
        "",
        "Output must include:",
        "- organization profile fields",
        "- researchPlans (list distinct plans/programs if described)",
        "",
        "Rules:",
        "- name must be the proper org/brand name (not slogans).",
        "- description: 2–4 sentences about the organization (not the disease).",
        "- clinicalStage: true only if explicit evidence exists (IND/enabling, trials, GMP/CMC, GLP tox).",
        `- therapeuticsOfInterest / therapeuticsInDevelopment must be chosen only from: ${JSON.stringify(
            TherapeuticsEnum.options
        )}`,
        "",
        "Research plans guidance:",
        "- 1+ researchPlans if concrete programs exist; otherwise [].",
        "- Split distinct programs; keep each plan focused on one main modality/strategy.",
        "- partners: labs/companies/consortia mentioned (do not include the org itself).",
        "- linkToMoreInfo: best supporting URL from provided pages.",
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
        text: { format: zodTextFormat(OrgOutSchema, "org_out") },
    });

    const raw = OrgOutSchema.parse(resp.output_parsed);

    const cleaned: OrgOut = {
        ...raw,
        website: canonicalWebsite,
        contactEmail: toEmailOrNull(raw.contactEmail),
        logo: toHttpUrlOrNull(raw.logo),
        image: toHttpUrlOrNull(raw.image),
        researchPlans: (raw.researchPlans ?? []).map((rp) => ({
            ...rp,
            linkToMoreInfo: toHttpUrlOrNull(rp.linkToMoreInfo),
        })),
    };

    return OrgOutSchema.parse(cleaned);
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
        const org = await extract(
            openai,
            canonical,
            fetched.bundle || `No readable page text fetched for: ${canonical}`
        );

        const name = (org.name || "").trim() || "New Organization";
        const description = (org.description || "").trim() || null;

        const subdomainBase = slugify(name) || "org";
        const subdomain = await ensureUniqueSubdomain(subdomainBase);

        const metadata: JsonObject = {
            ...(typeof org === "object" ? ({} as JsonObject) : {}),
            agent: {
                source: "agent:web_search->fetch->extract:v1",
                fetchedPages: fetched.pages.length,
                fetchedAt: new Date().toISOString(),
                scout: {
                    inputUrl,
                    canonicalWebsite: s.canonicalWebsite,
                    selectedUrls: s.selectedUrls,
                    notes: s.notes,
                },
            },
            // Store extracted research plans on the org so you don’t need a DB schema change today.
            // You can migrate these into first-class tables later.
            researchPlans: org.researchPlans,
            clinicalStage: org.clinicalStage,
            logo: org.logo,
        };

        const result = await prisma.$transaction(async (tx) => {
            const exists = await tx.organization.findUnique({ where: { subdomain } });
            if (exists) {
                return { ok: false as const, error: "This subdomain is already taken" };
            }

            const organization = await tx.organization.create({
                data: {
                    name,
                    description: description ?? undefined,
                    subdomain,
                    website: canonical,
                    contactEmail: org.contactEmail ?? undefined,
                    image: org.image ?? undefined,
                    therapeuticsInDevelopment: org.therapeuticsInDevelopment ?? [],
                    therapeuticsOfInterest: org.therapeuticsOfInterest ?? [],
                    verified: true, // keep your beta default
                    metadata,
                    user: { connect: { id: session.user.id } },
                },
            });

            const membership = await tx.member.create({
                data: {
                    userId: session.user.id,
                    email: session.user.email ?? "",
                    role: session.user.email?.toLowerCase().endsWith("@comendcare.com") ? "support" : "owner",
                    title: null,
                    organizationId: organization.id,
                },
            });

            await tx.user.update({
                where: { id: session.user.id },
                data: { activeOrganizationId: organization.id },
            });

            return { ok: true as const, organization, membership };
        });

        if (!result.ok) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            id: result.organization.id,
            success: true,
            organizationId: result.organization.id,
            subdomain: result.organization.subdomain,
            name: result.organization.name,
        });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e?.message || "Failed to create organization" },
            { status: 500 }
        );
    }
}
