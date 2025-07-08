import prisma from "@comend/lib/prisma"

import {MILESTONE_TYPE_OPTIONS, TOOL_TYPE_OPTIONS} from "@comend/lib/types";

async function main() {
    console.log('Starting seed script...');

    // seed milestone types
    await prisma.toolType.deleteMany()
    const toolTypes = await prisma.toolType.createMany({
        data: TOOL_TYPE_OPTIONS.map(({id, label, type}) => ({
            id,
            label,
            type
        })),
        skipDuplicates: true,
    })
}

main()
    .then(() => {
        console.log('Seeding finished successfully!');
    })
    .catch((error) => {
        console.error('Error seeding database:', error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
