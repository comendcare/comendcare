import prisma from "@/lib/prisma";
import fs from "fs/promises";
import { toKebabCase } from "@/lib/utils"

async function main() {
    console.log("Starting condition seed script...");

    // Load the JSON data
    const data = JSON.parse(await fs.readFile("data/conditions.json", "utf-8"));

    console.log(`Total conditions to process: ${data.length}`);

    let processedCount = 0;

    for (const condition of data) {
        try {
            const slug = toKebabCase(condition.name);

            await prisma.condition.create({
                data: {
                    name: condition.name,
                    slug,
                    description: condition.description || null,
                    metadata: {
                        synonyms: condition.synonyms || [],
                    },
                },
            });

            processedCount++;
            if (processedCount % 50 === 0) {
                console.log(`Processed ${processedCount} conditions...`);
            }
        } catch (error: any) {
            if (error.code === "P2002") {
                console.warn(
                    `Unique constraint violation for condition with slug '${toKebabCase(condition.name)}'. Skipping.`
                );
            } else {
                console.error(
                    `Failed to process condition with name '${condition.name}':`,
                    error
                );
            }
        }
    }

    console.log(`Condition seed script completed. Total processed: ${processedCount}`);
}

main()
    .then(() => console.log("Seeding finished successfully!"))
    .catch((err) => console.error("Error seeding conditions:", err))
    .finally(() => prisma.$disconnect());

