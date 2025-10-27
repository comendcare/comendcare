// scripts/seed-from-more-csv.ts
import 'dotenv/config';
import prisma from '@comend/lib/prisma';
import * as fs from 'fs/promises';
import { MILESTONE_TYPE_OPTIONS } from '@comend/lib/types';

/** ========= Config ========= */
const DATA_PATH = './packages/data/more-companies.csv'; // <-- change if needed

/** ========= Helpers ========= */
function normToken(s?: string | null): string {
    return (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function dedupe<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

/** Split on comma or semicolon, trim, drop empties */
function splitList(cell?: string | null): string[] {
    if (!cell) return [];
    return cell
        .split(/[;,]/g)
        .map((s) => s.trim())
        .filter(Boolean);
}

function toIntOrNull(v: unknown): number | null {
    if (v == null || v === '') return null;
    const n = parseInt(String(v).trim(), 10);
    return Number.isFinite(n) ? n : null;
}

function normUrl(u?: string | null): string {
    const raw = String(u ?? '').trim();
    if (!raw) return '';
    try {
        const url = raw.startsWith('http') ? new URL(raw) : new URL(`https://${raw}`);
        const host = url.hostname.replace(/^www\./, '');
        const path = url.pathname.replace(/\/+$/, '');
        return `${host}${path}${url.search}${url.hash}`;
    } catch {
        return raw.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
    }
}

/** Infer milestone types from (services only here, since this CSV has no categories column) */
function inferMilestoneTypesFromServices(services: string[]): string[] {
    const svcSet = new Set(services.map(normToken));
    const found: string[] = [];
    for (const opt of MILESTONE_TYPE_OPTIONS) {
        const svcHit = (opt.services ?? []).some((s) => svcSet.has(normToken(s)));
        if (svcHit) found.push(opt.id);
    }
    return Array.from(new Set(found));
}

/** ========= Minimal CSV parser that respects quotes ========= */
function parseCsvLine(line: string, delim = ','): string[] {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (inQuotes) {
            if (ch === '"') {
                // handle escaped quote ("")
                if (i + 1 < line.length && line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                cur += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === delim) {
                out.push(cur);
                cur = '';
            } else {
                cur += ch;
            }
        }
    }
    out.push(cur);
    return out;
}

async function readCSV(path: string): Promise<Record<string, string>[]> {
    const raw = await fs.readFile(path, 'utf-8');
    const lines = raw.replace(/\r/g, '').split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const header = parseCsvLine(lines[0]).map((h) => h.trim());
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        while (cols.length < header.length) cols.push('');
        const obj: Record<string, string> = {};
        header.forEach((key, idx) => {
            obj[key] = (cols[idx] ?? '').trim();
        });
        rows.push(obj);
    }
    return rows;
}

/** ========= Main ========= */
async function main() {
    console.log('Seeding from CSV:', DATA_PATH);
    const rows = await readCSV(DATA_PATH);
    console.log(`Total CSV rows: ${rows.length}`);

    let processed = 0;

    for (const row of rows) {
        const title = row['Name'] || '';
        const url = row['URL'] || '';
        const description = row['Description'] || null;
        const yearEstablished = toIntOrNull(row['Year established']);
        const headquarters = row['Headquarter location'] || null;

        const serviceNames = dedupe(splitList(row['Services']));
        const certificationNames = dedupe(splitList(row['Certifications']));
        const siteAddresses = dedupe(splitList(row['Sites']));
        const specialTags = dedupe(splitList(row['Special tags']));

        // Map "academic"/"nonprofit" → companyType
        let companyType: string | null = null;
        for (const tag of specialTags.map(normToken)) {
            if (tag === 'academic') {
                companyType = 'Academic Core Facility';
                break;
            }
            if (tag === 'nonprofit' || tag === 'non-profit') {
                companyType = 'Non-Profit';
                break;
            }
        }

        // Prefer explicit milestone types from CSV; if none, infer from services
        const csvMilestoneTypes = dedupe(splitList(row['Milestone types']));
        const milestoneTypes =
            csvMilestoneTypes.length > 0
                ? csvMilestoneTypes
                : inferMilestoneTypesFromServices(serviceNames);

        if (!title || !url) {
            console.warn(
                `Skipping row missing required fields (Name/URL). Row: ${JSON.stringify({
                    Name: title,
                    URL: url,
                })}`,
            );
            continue;
        }

        const metadata: Record<string, unknown> = {};
        if (row['Company size']) metadata.companySize = row['Company size'];

        try {
            await prisma.company.create({
                data: {
                    url,
                    website: url,
                    scientistDotComURL: null,
                    title,
                    description,
                    yearEstablished,
                    headquarters,
                    companyType,

                    categories: [],
                    simplifiedCertifications: [],
                    milestoneTypes,
                    tags: [], // no longer used for this dataset
                    avgRating: 0,

                    sites: {
                        create: siteAddresses.map((addr) => ({ name: null, address: addr })),
                    },
                    services: {
                        connectOrCreate: serviceNames.map((name) => ({
                            where: { name },
                            create: { name, description: null },
                        })),
                    },
                    certifications: {
                        connectOrCreate: certificationNames.map((name) => ({
                            where: { name },
                            create: { name },
                        })),
                    },

                    metadata: Object.keys(metadata).length ? metadata : undefined,
                },
            });

            processed++;
            if (processed % 50 === 0) {
                console.log(`Created ${processed} companies…`);
            }
        } catch (error: any) {
            if (error?.code === 'P2002') {
                console.error(`Unique constraint violation for "${title}" (${url}). Skipping.`);
            } else {
                console.error(`Failed to create "${title}" (${url}):`, error);
            }
        }
    }

    console.log(`Done. Created ${processed} company records.`);
}

main()
    .then(() => console.log('Seeding finished successfully!'))
    .catch((err) => console.error('Error seeding database:', err))
    .finally(async () => {
        await prisma.$disconnect();
    });
