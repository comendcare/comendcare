import {PrismaClient} from '@prisma/client';
import { MILESTONE_TYPE_OPTIONS } from './seed-options';

const prisma = new PrismaClient();

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
