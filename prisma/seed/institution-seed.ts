import prisma from "@comend/lib/prisma";
import * as fs from "fs/promises";

export async function seed() {
    console.log("Institutions: Starting institution seed script...");

    const raw = await fs.readFile("./packages/data/v1.69-2025-08-07-ror-data.json", "utf-8");
    const institutions = JSON.parse(raw);

    let processedCount = 0;

    await prisma.institution.deleteMany()
    for (const inst of institutions) {
        try {
            await prisma.institution.upsert({
                where: { rorId: inst.id },
                update: {},
                create: {
                    rorId: inst.id,
                    name: inst.name,
                    established: inst.established || null,
                    types: inst.types || [],
                    aliases: inst.aliases || [],
                    acronyms: inst.acronyms || [],
                    status: inst.status,
                    wikipediaUrl: inst.wikipedia_url || null,
                    website: inst.links?.[0] || null,
                    city: inst.addresses?.[0]?.city || null,
                    countryName: inst.country?.country_name || null,
                    countryCode: inst.country?.country_code || null,

                    fundrefAll: inst.external_ids?.FundRef?.all || [],
                    fundrefPreferred: inst.external_ids?.FundRef?.preferred || null,
                    gridAll: inst.external_ids?.GRID?.all || "",
                    gridPreferred: inst.external_ids?.GRID?.preferred || null,
                    isniAll: inst.external_ids?.ISNI?.all || [],
                    wikidataAll: inst.external_ids?.Wikidata?.all || [],
                },
            });

            processedCount++;
        } catch (error: any) {
            console.error(`Failed to process institution ${inst.name} (${inst.id}):`, error);
        }
    }

    console.log(`Institutions: Processed ${processedCount} records in total.`);

    // Process relationships
    let relationshipCount = 0;

    for (const inst of institutions) {
        const fromRorId = inst.id;

        if (inst.relationships?.length > 0) {
            for (const rel of inst.relationships) {
                try {
                    // Fetch UUIDs for the relationship
                    const institutionsFound = await prisma.institution.findMany({
                        where: {
                            rorId: { in: [fromRorId, rel.id] },
                        },
                        select: { id: true, rorId: true },
                    });

                    const fromInst = institutionsFound.find(i => i.rorId === fromRorId);
                    const toInst = institutionsFound.find(i => i.rorId === rel.id);

                    if (fromInst && toInst) {
                        await prisma.institutionRelationship.create({
                            data: {
                                type: rel.type,
                                label: rel.label,
                                institutionId: fromInst.id,
                                relatedId: toInst.id,
                            },
                        });

                        relationshipCount++;
                    } else {
                        console.warn(`Skipping relationship from ${fromRorId} to ${rel.id}: one or both institutions not found`);
                    }
                } catch (error: any) {
                    console.error(`Failed to create relationship from ${fromRorId} to ${rel.id}:`, error);
                }
            }
        }
    }

    console.log(`Institutions: Created ${relationshipCount} relationships.`);
}

seed()
    .then(() => {
        console.log("Institutions: Seeding finished successfully!");
    })
    .catch((err) => {
        console.error("Institutions: Error during seeding:", err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
