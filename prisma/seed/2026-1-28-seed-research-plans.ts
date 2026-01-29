import 'dotenv/config';
import prisma from '@comend/lib/prisma';
import * as fs from 'fs/promises';
import { RESEARCH_PLAN_STATUS, RESEARCH_PLAN_TYPES, RESEARCH_STAGE } from '@comend/lib/types';

const DATA_PATH = './packages/data/DemoPlans.csv'
const ADMIN_EMAILS = [
  "megan@comendcare.com",
  "albert@comendcare.com",
  "flawnson@comendcare.com",
];

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

export function orgNameToUrl(name: string): string {
  return name
    .trim() // remove leading/trailing spaces
    .toLowerCase() // lowercase everything
    .replace(/\s+/g, "-"); // replace one or more spaces with a single dash
}

async function getAdminUsers() {
    const users = [];

    for (const email of ADMIN_EMAILS) {
        const user = await prisma.user.findFirst({where: { email }});
        if (user) users.push(user);
    }

    return users;
}

const main = async () => {
    console.log('Seeding from CSV:', DATA_PATH);
    const rows = await readCSV(DATA_PATH);
    console.log(`Total CSV rows: ${rows.length}`);

    let processed = 0;

    for (const row of rows) {
        const title = row['Title'] || '';
        const therapeuticStrategy = row['Therapeutic strategy'] || '';
        const orgName = row['Patient group'] || '';
        const partners = row['Partners'] || '';
        const description = row['Description'] || '';
        const stage = row['Stage'] || '';
        const status = row['Status'] || ''

        try {
            // 1️⃣ Find existing org by name (if any)
            let organization = await prisma.organization.findFirst({
                where: { name: orgName },
            });

            // 2️⃣ If not found, create new org
            if (!organization) {
                // Find the users by email
                const users = await getAdminUsers()
                console.log(`users`, users)

                organization = await prisma.organization.create({
                    data: { 
                        name: orgName,
                        verified: false,
                        published: false,
                        subdomain: orgNameToUrl(title),
                        members: {
                            create: users.map((user) => ({
                                userId: user.id,
                                email: user.email!,
                                role: "support",
                            })),
                        },
                    },
                });

                console.log(`Created organization "${orgName}" with ${users.length} members`);
            } else {
                console.log(`Found organization "${orgName}"`)
            }

            // 3️⃣ Create the research plan and connect to the org
            const researchPlan = await prisma.roadmap.create({
                data: {
                    private: false,
                    title,
                    modalities: RESEARCH_PLAN_TYPES.filter(option => option.label === therapeuticStrategy)?.map(option => option.value) || [] as string[],
                    partners: {
                        create: {
                            affiliation: partners
                        }
                    },
                    description,
                    stages: RESEARCH_STAGE.filter(option => option.label === stage)?.map(option => option.value) || [] as string[],
                    statuses: RESEARCH_PLAN_STATUS.filter(option => option.label === status)?.map(option => option.value) || [] as string[],
                    organization: {
                        connect: { id: organization.id },
                    },
                },
            });

            console.log(`Created research plan`, researchPlan)
            console.log(`Created research plan "${title}" for org "${organization.name}"`);
        } catch (e) {
            console.error("Error importing row:", row, e);
        }
    }

    console.log(`Done. Created ${processed} company records.`);
}

main()