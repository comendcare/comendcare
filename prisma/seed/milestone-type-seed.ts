import prisma from "@comend/lib/prisma"
import {MILESTONE_TYPE_OPTIONS} from "@comend/lib/types";

export async function seed() {
    console.log('Milestone Types: Starting seed script...');
    await prisma.milestoneType.deleteMany()
    await prisma.milestoneType.createMany({
        data: MILESTONE_TYPE_OPTIONS.map(type => ({
            id: type.id,
            label: type.label,
            services: type.services,
            categories: type.categories,
            description: type.description
        })),
        skipDuplicates: true
    })

    // const types = MILESTONE_TYPE_OPTIONS.map(type => ({
    //     id: type.id,
    //     label: type.label,
    //     services: type.services,
    //     categories: type.categories,
    //     description: type.description
    // }))

    // for (const type of types) {
    //     try {
    //         await prisma.milestoneType.createMany({
    //             data: type,
    //             skipDuplicates: true
    //         })
    //     } catch (error: any) {
    //         if (error.code === 'P2002') {
    //             console.error(
    //                 `Unique constraint violation for milestone type with ID ${type.id}. Skipping.`
    //             );
    //         } else {
    //             console.error(`Failed to process milestone type with ID ${type.id}:`, error);
    //         }
    //     }
    // }


    // await Promise.all(MILESTONE_TYPE_OPTIONS.map(type => (
    //     prisma.milestoneType.upsert({
    //         where: {id: type.id},
    //         update: {
    //             label: type.label,
    //             services: type.services,
    //             categories: type.categories,
    //             description: type.description
    //         },
    //         create: {
    //             id: type.id,
    //             label: type.label,
    //             services: type.services,
    //             categories: type.categories,
    //             description: type.description
    //         }
    //     })
    // )))
}

seed()
    .then(() => {
        console.log('Milestone Types: Seeding finished successfully!');
    })
    .catch((error) => {
        console.error('Milestone Types: Error seeding database:', error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
