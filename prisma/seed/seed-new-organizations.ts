// seed-organizations.ts
// This seed script is meant to help during development, and not to be used to seed production databases
import * as fs from "fs"
import * as path from "path"
import prisma from "@comend/lib/prisma"
import { addTypeSenseDocument, createTypeSenseCollection, sendTypeSenseRequest } from "@comend/lib/utils"

// ---- modality mapping (value -> label) ----
const MODALITY_VALUE_TO_LABEL: Record<string, string> = {
    GENE_THERAPY_AAV: "Gene replacement therapy",
    GENE_THERAPY: "Gene replacement therapy",

    DRUG_REPURPOSING_SCREENING: "Drug screening or repurposing",
    DRUG_REPURPOSING: "Drug screening or repurposing",

    ANTISENSE_OLIGONUCLEOTIDE: "Antisense oligonucleotide (ASO)",
    TOOL_DEVELOPMENT: "Therapeutic-agnostic tool development",
    ENZYME_REPLACEMENT: "Enzyme or protein replacement",
    NOVEL_CHEMISTRY: "Small molecule",
    GENE_EDITING: "Gene editing",
    OTHER_RNA_THERAPY: "Other RNA therapy",
    STEM_CELL_TRANSPLANT: "Cell therapies",
    DISEASE_CHARACTERIZATION: "Disease characterization",
    EXPLORATORY_RESEARCH: "Basic science",
    SUPPLEMENTS: "Supplements",
    ANTIBODIES: "Antibody therapy",
    VACCINE: "Vaccine",
    MEDICAL_DEVICE: "Medical device",
    OTHER: "Other",
}

// ---------- helpers ----------
function readJsonFile(filePath: string): any {
    const abs = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
    const raw = fs.readFileSync(abs, "utf8")
    return JSON.parse(raw)
}

function slugify(input: string) {
    return input
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 63)
}

function ensureUniqueSlug(base: string, used: Set<string>) {
    let s = base || "org"
    if (!used.has(s)) {
        used.add(s)
        return s
    }
    let i = 2
    while (used.has(`${s}-${i}`)) i++
    const out = `${s}-${i}`
    used.add(out)
    return out
}

function asStringOrNull(v: any): string | null {
    if (v === null || v === undefined) return null
    const s = String(v).trim()
    if (!s || s.toLowerCase() === "null") return null
    return s
}

function asStringArray(v: any): string[] {
    if (!Array.isArray(v)) return []
    return v
        .map((x) => (x === null || x === undefined ? "" : String(x).trim()))
        .filter((x) => x.length > 0)
}

function mapModalitiesToLabels(list: string[]): string[] {
    return (list || []).map((item) => {
        const trimmed = item?.trim()
        if (!trimmed) return trimmed
        return MODALITY_VALUE_TO_LABEL[trimmed] ?? trimmed
    })
}

// ---------- main ----------
async function main() {
    const jsonPath = process.argv[2]
    const memberUserId = process.argv[3]

    if (!jsonPath || !memberUserId) {
        console.error("Usage: tsx seed-organizations.ts path-to-json-file.json userId")
        process.exit(1)
    }

    const data = readJsonFile(jsonPath)
    if (!Array.isArray(data)) {
        console.error("Expected top-level JSON array of organizations.")
        process.exit(1)
    }

    const memberUser = await prisma.user.findUnique({
        where: { id: memberUserId },
        select: { id: true, email: true },
    })

    if (!memberUser) {
        console.error(`No user found with id: ${memberUserId}`)
        process.exit(1)
    }

    // Reset TypeSense collection (optional but mirrors your existing seed pattern)
    try {
        await sendTypeSenseRequest(
            `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}/collections/organizations`,
            "DELETE",
            (
                process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                    ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                    : process.env.TYPESENSE_ADMIN_API_KEY
            )!,
        )
        console.log(`Deleted existing collection: "organizations"`)
    } catch {
        console.log(`Collection organizations does not exist. Skipping delete.`)
    }

    await createTypeSenseCollection(
        `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
        (
            process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                : process.env.TYPESENSE_ADMIN_API_KEY
        )!,
        {
            name: "organizations",
            fields: [
                { name: "id", type: "string", facet: false, index: true, optional: false, sort: true, store: true },
                { name: "name", type: "string", facet: false, index: true, optional: true, sort: true, store: true },
                { name: "description", type: "string", facet: false, index: true, optional: true, sort: false, store: true },
                { name: "yearFounded", type: "string", facet: false, index: true, optional: true, sort: false, store: true },
                { name: "moneyRaised", type: "int64", facet: false, index: true, optional: true, sort: true, store: true },
                { name: "moneyDeployed", type: "int64", facet: false, index: true, optional: true, sort: true, store: true },
            ],
        },
    )
    console.log(`Created typesense organizations collection...`)

    // Ensure unique slugs for subdomain/customDomain (those are @unique in your schema)
    const existing = await prisma.organization.findMany({
        select: { subdomain: true, customDomain: true },
    })
    const usedSlugs = new Set<string>()
    for (const o of existing) {
        if (o.subdomain) usedSlugs.add(o.subdomain)
        if (o.customDomain) usedSlugs.add(o.customDomain)
    }

    // Seed organizations
    for (const org of data) {
        const name = asStringOrNull(org?.name) ?? null

        // If incoming has explicit subdomain/customDomain use them (if unique),
        // else derive a unique slug from name.
        const requestedSubdomain = asStringOrNull(org?.subdomain)
        const requestedCustomDomain = asStringOrNull(org?.customDomain)

        const baseSlug = slugify(name ?? "org")
        const chosenSubdomain =
            requestedSubdomain && !usedSlugs.has(requestedSubdomain)
                ? (usedSlugs.add(requestedSubdomain), requestedSubdomain)
                : ensureUniqueSlug(baseSlug, usedSlugs)

        // Custom domain often should be null in dev unless explicitly provided and unique
        const chosenCustomDomain =
            requestedCustomDomain && !usedSlugs.has(requestedCustomDomain)
                ? (usedSlugs.add(requestedCustomDomain), requestedCustomDomain)
                : null

        const created = await prisma.organization.create({
            data: {
                public: Boolean(org?.public ?? true),
                verified: Boolean(org?.verified ?? false),
                published: Boolean(org?.published ?? true),

                name,
                description: asStringOrNull(org?.description),
                patientPriorities: asStringOrNull(org?.patientPriorities),

                contactEmail: asStringOrNull(org?.contactEmail),

                logo: asStringOrNull(org?.logo) ?? undefined, // keep schema default if not provided
                image: asStringOrNull(org?.image),
                headerImage: asStringOrNull(org?.headerImage),

                subdomain: chosenSubdomain,
                customDomain: chosenCustomDomain,

                yearFounded: asStringOrNull(org?.yearFounded),
                incorporationStatus: org?.incorporationStatus ?? null,

                therapeuticsOfInterest: mapModalitiesToLabels(asStringArray(org?.therapeuticsOfInterest)),
                therapeuticsInDevelopment: mapModalitiesToLabels(asStringArray(org?.therapeuticsInDevelopment)),

                website: asStringOrNull(org?.website),

                moneyRaised: org?.moneyRaised ?? null,
                moneyDeployed: org?.moneyDeployed ?? null,
                researchBudget: org?.researchBudget ?? null,

                address1: asStringOrNull(org?.address1),
                address2: asStringOrNull(org?.address2),
                formattedAddress: asStringOrNull(org?.formattedAddress),
                city: asStringOrNull(org?.city),
                region: asStringOrNull(org?.region),
                postalCode: asStringOrNull(org?.postalCode),
                country: asStringOrNull(org?.country),
                lat: asStringOrNull(org?.lat),
                lng: asStringOrNull(org?.lng),

                metadata: org?.metadata ?? null,
            },
        })

        // Create member row for the provided user (skipDuplicates via unique constraint)
        await prisma.member.upsert({
            where: {
                userId_organizationId: {
                    userId: memberUser.id,
                    organizationId: created.id,
                },
            },
            update: {},
            create: {
                role: "support",
                email: memberUser.email,
                user: { connect: { id: memberUser.id } },
                organization: { connect: { id: created.id } },
            },
        })

        // Add to TypeSense
        try {
            await addTypeSenseDocument(
                `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
                (
                    process.env.NEXT_PUBLIC_NODE_ENV === "development" || process.env.NEXT_PUBLIC_NODE_ENV === "preview"
                        ? process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
                        : process.env.TYPESENSE_ADMIN_API_KEY
                )!,
                {
                    id: created.id,
                    name: created.name,
                    description: created.description,
                    yearFounded: created.yearFounded,
                    moneyRaised: created.moneyRaised,
                    moneyDeployed: created.moneyDeployed,
                },
                "organizations",
            )
            console.log(`Seeded + indexed: ${created.name ?? created.id}`)
        } catch (e) {
            console.error(`Seeded but failed to index: ${created.name ?? created.id}`, e)
        }
    }

    console.log(`Done. Seeded ${data.length} organizations.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })