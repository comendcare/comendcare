import prisma from "@/lib/prisma"

import {MILESTONE_TYPE_OPTIONS} from "@/lib/types";

async function main() {
    console.log('Starting seed script...');

    // seed milestone types
    await prisma.milestoneType.deleteMany()
    const milestoneTypes = await prisma.milestoneType.createMany({
        data: MILESTONE_TYPE_OPTIONS
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
