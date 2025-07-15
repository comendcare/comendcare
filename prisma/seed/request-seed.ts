import prisma from "@comend/lib/prisma";
import { faker } from "@faker-js/faker";

async function main() {
    console.log("Starting MaterialAndDataAccessRequest seed script...");

    const organizations = await prisma.organization.findMany({ select: { id: true } });
    const researchers = await prisma.researcher.findMany({
        select: {
            id: true,
            affiliations: {
                select: { institutionId: true },
            },
        },
    });

    if (organizations.length === 0 || researchers.length === 0) {
        throw new Error("Cannot seed without existing organizations and researchers.");
    }

    const NUM_REQUESTS = 9;
    let createdCount = 0;

    for (let i = 0; i < NUM_REQUESTS; i++) {
        const org = faker.helpers.arrayElement(organizations);
        const researcher = faker.helpers.arrayElement(researchers);

        const institutionIds = researcher.affiliations.map((a) => a.institutionId).filter(Boolean);

        if (institutionIds.length === 0) {
            console.warn(`Skipping researcher ${researcher.id} with no affiliated institutions`);
            continue;
        }

        try {
            const request = await prisma.materialAndDataAccessRequest.create({
                data: {
                    title: faker.lorem.sentence(),
                    description: faker.lorem.paragraph(),
                    status: faker.helpers.arrayElement(["PENDING", "APPROVED", "REJECTED", "UNDER_REVIEW"]),
                    organizationId: org.id,
                    researcherId: researcher.id,
                    submittedAt: faker.date.past(),
                    sampleCount: faker.number.int({ min: 1, max: 100 }),
                    sampleTypes: faker.helpers.arrayElements(
                        ["blood", "tissue", "saliva", "plasma", "serum", "cell line"],
                        faker.number.int({ min: 1, max: 3 })
                    ),
                    dataTypes: faker.helpers.arrayElements(
                        ["genomic", "proteomic", "clinical", "imaging", "epigenetic"],
                        faker.number.int({ min: 1, max: 3 })
                    ),
                    metadata: {
                        purpose: faker.lorem.words(5),
                        filesRequested: faker.number.int({ min: 1, max: 10 }),
                    },
                },
            });

            await prisma.institutionToRequest.createMany({
                data: institutionIds.map((institutionId) => ({
                    institutionId,
                    requestId: request.id,
                })),
                skipDuplicates: true,
            });

            createdCount++;
            if (createdCount % 5 === 0) {
                console.log(`Created ${createdCount} requests...`);
            }
        } catch (error) {
            console.error(`Failed to create request ${i + 1}:`, error);
        }
    }

    console.log(`Seeding completed. Total created: ${createdCount}`);
}

main()
    .then(() => console.log("Seeding finished successfully!"))
    .catch((err) => console.error("Error seeding requests:", err))
    .finally(() => prisma.$disconnect());
