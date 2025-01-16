import { PrismaClient } from '@prisma/client';
import Typesense from 'typesense';
import {CollectionCreateSchema} from "typesense/lib/Typesense/Collections";

const prisma = new PrismaClient();

async function resetAndSyncTypesense(env: { TYPESENSE_ADMIN_API_KEY: string; TYPESENSE_URL: string }) {
    const client = new Typesense.Client({
        nodes: [
            {
                host: env.TYPESENSE_URL.replace('https://', ''),
                port: 443,
                protocol: 'https',
            },
        ],
        apiKey: env.TYPESENSE_ADMIN_API_KEY,
        connectionTimeoutSeconds: 5,
    });

    try {
        // Define schemas
        const organizationSchema: CollectionCreateSchema = {
            name: 'organizations',
            fields: [
                { name: 'id', type: 'string', facet: false },
                { name: 'name', type: 'string', facet: false },
                { name: 'description', type: 'string', facet: false },
            ],
        };

        const milestoneSchema: CollectionCreateSchema = {
            name: 'milestones',
            fields: [
                { name: 'id', type: 'string', facet: false },
                { name: 'title', type: 'string', facet: false },
                { name: 'description', type: 'string', facet: false },
            ],
        };

        // Fetch existing collections
        const collections = await client.collections().retrieve();

        // Delete existing collections
        for (const collection of collections) {
            await client.collections(collection.name).delete();
            console.log(`Deleted collection: ${collection.name}`);
        }

        // Create new collections
        await client.collections().create(organizationSchema);
        console.log('Created collection: organizations');

        await client.collections().create(milestoneSchema);
        console.log('Created collection: milestones');

        // Fetch data from Prisma
        const organizations = await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                logo: true,
                subdomain: true,
                verified: true,
                public: true,
            },
        });

        const milestones = await prisma.milestone.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                budget: true,
                private: true,
                startDate: true,
                endDate: true,
                organizationId: true,
            },
        });

        // Prepare and import data into Typesense
        if (organizations.length > 0) {
            await client.collections('organizations').documents().import(organizations, { action: 'create' });
            console.log(`Imported ${organizations.length} organizations.`);
        }

        if (milestones.length > 0) {
            // Convert dates to timestamps for Typesense
            const milestoneData = milestones.map((milestone) => ({
                ...milestone,
                startDate: milestone.startDate ? new Date(milestone.startDate).getTime() : null,
                endDate: milestone.endDate ? new Date(milestone.endDate).getTime() : null,
            }));

            await client.collections('milestones').documents().import(milestoneData, { action: 'create' });
            console.log(`Imported ${milestones.length} milestones.`);
        }

        console.log('Typesense reset and sync completed successfully!');
    } catch (error) {
        console.error('Error during reset and sync:', error);
    } finally {
        await prisma.$disconnect();
    }
}

export default async function handler(req: Request) {
    const env = {
        TYPESENSE_ADMIN_API_KEY: process.env.TYPESENSE_ADMIN_API_KEY!,
        TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
    };

    if (req.method === 'POST') {
        await resetAndSyncTypesense(env);
        return new Response('Typesense collections reset and sync complete', { status: 200 });
    } else {
        return new Response('Method not allowed', { status: 405 });
    }
}
