import {Prisma, PrismaClient} from '@prisma/client';
import { MILESTONE_TYPE_OPTIONS } from './seed-options';
import { DefaultArgs } from '@prisma/client/runtime/library';

const prismaClient = new PrismaClient();

export async function main(prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
    console.log('Starting seed script...');

    // seed milestone types
    await prisma.milestoneType.deleteMany()
    const services = await prisma.service.findMany()

    // Create milestone types
    await prisma.milestoneType.createMany({
        data: MILESTONE_TYPE_OPTIONS.map(({ services: [], ...option }) => option), 
        skipDuplicates: true
    })
  
    // Fetch the created milestone types to get their IDs
    const milestoneTypes = await prisma.milestoneType.findMany({
        where: {
            id: { in: MILESTONE_TYPE_OPTIONS.map(option => option.id) }
        }
    })
  
    // Connect services to milestone types
    await Promise.all(milestoneTypes.map(async (milestoneType) => {
        const serviceConnections = MILESTONE_TYPE_OPTIONS
            .find(option => option.id === milestoneType.id)
            ?.services.map((serviceName: string) => {
                const service = services.find(s => s.name === serviceName)
                return service ? { id: service.id } : null
            })
            .filter(Boolean)
    
            if (serviceConnections.length > 0) {
            await prisma.milestoneType.update({
                where: { id: milestoneType.id },
                data: { services: { connect: serviceConnections } }
            })
        }
    }))
}

main(prismaClient)
    .then(() => {
        console.log('Seeding finished successfully!');
    })
    .catch((error) => {
        console.error('Error seeding database:', error);
    })
    .finally(async () => {
        await prismaClient.$disconnect();
    });
