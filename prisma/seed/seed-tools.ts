import prisma from "@/lib/prisma"
import fs from 'fs/promises';

async function main() {
    console.log('Starting seed script...');

    // Load the JSON data
    const tools = JSON.parse(await fs.readFile('./data/assets-export.json', 'utf-8'));

    console.log(`Total records to process: ${tools.length}`);

    let processedCount = 0;

    for (const tool of tools) {
        try {
            await prisma.tool.create({
                data: {
                    id: tool.id,
                    createdAt: tool.createdAt,
                    updatedAt: tool.updatedAt,
                    title: tool.title,
                    description: tool.description,
                    private: tool.private,
                    pinned: tool.pinned,
                    metadata: tool.metadata,
                    organization: {connect: {id: tool.organizationId}},
                    ...(tool.contacts.length > 0 ? {
                        contacts: {connectOrCreate: tool.contacts.map((contact: any) => ({
                            where: {id: contact.id},
                            create: {
                                id: contact.id,
                                name: contact.name,
                                role: contact.role,
                                email: contact.email,
                                affiliation: contact.affiliation,
                                // rfp: {connect: {id: contact.rfpId}},
                                // milestone: {connect: {id: contact.milestoneId}}
                            }
                        }))}
                    } : undefined),
                    ...(tool.attachments.length > 0 ? {
                        attachments: {connectOrCreate: tool.attachments.map((attachment: any) => ({
                            where: {id: attachment.id},
                            create: {
                                id: attachment.id,
                                name: attachment.name,
                                link: attachment.link
                                // rfp: {connect: {id: contact.rfpId}},
                                // milestone: {connect: {id: contact.milestoneId}}
                            }
                        }))}
                    } : undefined),
                    ...(tool.milestones.length > 0 ? {
                        milestones: {connectOrCreate: tool.milestones.map((milestone: any) => ({
                            where: {id: milestone.id},
                            create: {
                                id: milestone.id,
                                milestone: {connect: {id: milestone.milestoneId}}
                            }
                        }))}
                    } : undefined)
                }
            })

            processedCount = processedCount + 1
        } catch (error: any) {
            console.log(`error`, error)
        }
    }

    console.log(`Seed script completed. Processed ${processedCount} records in total.`);
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