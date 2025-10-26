// scripts/seed-from-csv.ts
import 'dotenv/config';
import prisma from "@comend/lib/prisma";
import * as fs from "fs/promises";
import {MILESTONE_TYPE_OPTIONS} from "@comend/lib/types";

/** ========= Extra Config (JSON merge) ========= */
const JSON_SERVICES_PATH = "./packages/data/new_dataset.json"; // path to your JSON dataset

/** Normalize for fuzzy matching (case-insensitive, ignore punctuation/space) */
function normToken(s?: string | null): string {
    return (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/** Given categories + services, infer milestone type IDs from MILESTONE_TYPE_OPTIONS */
function inferMilestoneTypes(companyCategories: string[], companyServices: string[]): string[] {
    const catSet = new Set(companyCategories.map(normToken));
    const svcSet = new Set(companyServices.map(normToken));

    const found: string[] = [];
    for (const opt of MILESTONE_TYPE_OPTIONS) {
        const catHit = (opt.categories ?? []).some((c) => catSet.has(normToken(c)));
        const svcHit = (opt.services ?? []).some((s) => svcSet.has(normToken(s)));
        if (catHit || svcHit) found.push(opt.id);
    }
    // de-dupe while preserving the options order above
    return Array.from(new Set(found));
}

/** Normalize URLs so http/https/www/trailing-slash don't matter */
function normUrl(u: string): string {
    try {
        const url = u?.startsWith("http") ? new URL(u) : new URL(`https://${u}`);
        const host = url.hostname.replace(/^www\./, "");
        const path = url.pathname.replace(/\/+$/, "");
        return `${host}${path}`;
    } catch {
        return String(u || "")
            .trim()
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .replace(/\/+$/, "");
    }
}

/** ========= Config ========= */
const DATA_PATH = "./packages/data/new-cros.tsv"; // <-- change if needed
const DELIM = "\t"; // Use ',' if your file is comma-separated

/** ========= Helpers ========= */
function splitList(cell?: string | null): string[] {
    if (!cell) return [];
    return cell
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
}

function toIntOrNull(v: unknown): number | null {
    if (v === null || v === undefined || v === "") return null;
    const n = parseInt(String(v).trim(), 10);
    return Number.isFinite(n) ? n : null;
}

function dedupe(arr: string[]): string[] {
    return Array.from(new Set(arr));
}

/** Basic TSV/CSV reader that handles tabs safely (and commas in descriptions) */
async function readDelimited(path: string, delim: string): Promise<Record<string, string>[]> {
    const raw = await fs.readFile(path, "utf-8");

    // Normalize line endings and drop empty trailing lines
    const lines = raw.replace(/\r/g, "").split("\n").filter((l) => l.trim().length > 0);

    if (lines.length === 0) return [];

    const header = lines[0].split(delim).map((h) => h.trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delim);
        // Pad missing columns (just in case)
        while (cols.length < header.length) cols.push("");
        const obj: Record<string, string> = {};
        header.forEach((key, idx) => {
            obj[key] = (cols[idx] ?? "").trim();
        });
        rows.push(obj);
    }
    return rows;
}

async function main() {
    console.log("Starting seed script from CSV/TSV…");

    const rows = await readDelimited(DATA_PATH, DELIM);
    console.log(`Total records to process: ${rows.length}`);

    let processedCount = 0;

    // Load JSON dataset (for services override)
    let servicesByUrl = new Map<string, { name: string; description?: string | null }[]>();
    try {
        const jsonRaw = await fs.readFile(JSON_SERVICES_PATH, "utf-8");
        const jsonData = JSON.parse(jsonRaw) as Array<{
            url: string;
            services?: { name: string; description?: string | null }[];
        }>;
        for (const rec of jsonData) {
            if (rec?.url) servicesByUrl.set(normUrl(rec.url), rec.services ?? []);
        }
        console.log(`Loaded JSON services for ${servicesByUrl.size} URLs from ${JSON_SERVICES_PATH}`);
    } catch (e) {
        console.warn(`⚠️ Could not load JSON services from ${JSON_SERVICES_PATH}. Proceeding without overrides.`, e);
    }

    for (const row of rows) {
        // Map CSV columns -> Company fields
        const url = row.url || "";
        const scientistDotComURL = row.scientistDotComURL || null;
        const title = row.title || "";
        const description = row.description || null;
        const yearEstablished = toIntOrNull(row.yearEstablished);
        const website = row.website || null;
        const headquarters = row.headquarters || null;
        const companyType = row.companyType || null;

        // Arrays
        const categories = dedupe(splitList(row.categories));
        const simplifiedCertifications = dedupe(splitList(row.simplifiedCertifications));
        const tags: string[] = []; // not provided in CSV
        // We'll compute milestoneTypes below after we know services (CSV and/or JSON overrides)
        let milestoneTypes: string[] = [];

        // Services/Certifications columns are assumed to be semicolon-separated names
        const serviceNames = dedupe(splitList(row.services));
        const certificationNames = dedupe(splitList(row.certifications));

        // RFIs: assume semicolon-separated names (dates unknown -> null)
        const rfiNames = dedupe(splitList(row.rfis));

        // Sites: if provided, treat each entry as an address (no name provided in CSV)
        const siteAddresses = dedupe(splitList(row.sites));

        // Collect unmapped columns into metadata (nice to have)
        const metadata: Record<string, unknown> = {};
        const knownKeys = new Set([
            "url",
            "scientistDotComURL",
            "title",
            "description",
            "yearEstablished",
            "website",
            "headquarters",
            "companyType",
            "professionalAssociates",
            "simplifiedCertifications",
            "categories",
            "certifications",
            "services",
            "rfis",
            "sites",
        ]);

        for (const [k, v] of Object.entries(row)) {
            if (!knownKeys.has(k)) metadata[k] = v;
        }
        // Optionally keep professionalAssociates explicitly
        if (row.professionalAssociates) {
            metadata.professionalAssociates = splitList(row.professionalAssociates);
        }

        // Minimal validation (require url + title)
        if (!url || !title) {
            console.warn(`Skipping row missing required fields (url/title). Row: ${JSON.stringify(row)}`);
            continue;
        }

        const jsonServices = servicesByUrl.get(normUrl(url));
        const servicesPayload = jsonServices && jsonServices.length
            ? {
                connectOrCreate: jsonServices.map((s) => ({
                    where: { name: s.name },
                    create: { name: s.name, description: s.description ?? null },
                })),
            }
            : {
                connectOrCreate: serviceNames.map((name) => ({
                    where: { name },
                    create: { name, description: null },
                })),
            };

        // Build the effective service-name list used for milestone inference
        const effectiveServiceNames = dedupe([
            ...serviceNames,
            ...((jsonServices ?? []).map((s) => s.name)),
        ]);

        // Infer milestone types from categories + services
        milestoneTypes = inferMilestoneTypes(categories, effectiveServiceNames);

        try {
            await prisma.company.create({
                data: {
                    url,
                    scientistDotComURL,
                    title,
                    description,
                    yearEstablished,
                    website,
                    headquarters,
                    companyType,

                    // Sites: create addresses if present
                    sites: {
                        create: siteAddresses.map((addr) => ({
                            name: null, // CSV doesn’t specify names
                            address: addr,
                        })),
                    },

                    // Services: connect or create by unique "name"
                    services: servicesPayload,

                    // Certifications: connect or create by unique "name"
                    certifications: {
                        connectOrCreate: certificationNames.map((name) => ({
                            where: { name },
                            create: { name },
                        })),
                    },

                    simplifiedCertifications,

                    categories,

                    milestoneTypes,

                    tags,

                    avgRating: 0,

                    rfis: {
                        create: rfiNames.map((name) => ({
                            name,
                            submittedOn: null,
                        })),
                    },

                    metadata: Object.keys(metadata).length ? metadata : undefined,
                },
            });

            processedCount++;
            if (processedCount % 100 === 0) {
                console.log(`Processed ${processedCount} records…`);
            }
        } catch (error: any) {
            if (error?.code === "P2002") {
                console.error(`Unique constraint violation for company "${title}". Skipping.`);
            } else {
                console.error(`Failed to process company "${title}":`, error);
            }
        }
    }

    console.log(`Seed script completed. Processed ${processedCount} records in total.`);
}

main()
    .then(() => console.log("Seeding finished successfully!"))
    .catch((error) => console.error("Error seeding database:", error))
    .finally(async () => {
        await prisma.$disconnect();
    });
