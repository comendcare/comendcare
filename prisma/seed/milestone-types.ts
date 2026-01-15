import prisma from "@comend/lib/prisma"

import {MILESTONE_TYPE_OPTIONS} from "@comend/lib/types";

async function main() {
    console.log('Starting seed script...');

    // seed milestone types
    // await prisma.milestoneType.deleteMany()
    // const milestoneTypes = await prisma.milestoneType.createMany({
    //     data: MILESTONE_TYPE_OPTIONS.map(type => ({
    //         id: type.id,
    //         label: type.label,
    //         services: type.services,
    //         categories: type.categories,
    //         description: type.description
    //     }))
    // })

    const milestoneTypes = await Promise.all(MILESTONE_TYPE_OPTIONS.map(type => (
        prisma.milestoneType.upsert({
            where: {id: type.id},
            update: {
                label: type.label,
                services: type.services,
                categories: type.categories,
                description: type.description
            },
            create: {
                id: type.id,
                label: type.label,
                services: type.services,
                categories: type.categories,
                description: type.description
            }
        })
    )))

    console.log(`milestone types`)
    console.log(milestoneTypes)
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
