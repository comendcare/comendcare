import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withPulse } from '@prisma/extension-pulse/node';

const initPrismaClient = () => new PrismaClient();

const sendTypeSenseRequest = async (
    url: string,
    method: string,
    apiKey: string,
    data?: any,
) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-TYPESENSE-API-KEY': apiKey,
    };
    const body = data ? JSON.stringify(data) : undefined;
    const response = await fetch(url, { method, headers, body });
    return response.json();
};

const manageCollection = async (
    typesenseUrl: string,
    apiKey: string,
    collectionName: string,
    schema?: any
) => {
    const collectionUrl = `${typesenseUrl}/collections/${collectionName}`;
    try {
        // Delete the collection if it exists
        await sendTypeSenseRequest(collectionUrl, 'DELETE', apiKey);
        console.log(`Deleted existing collection: ${collectionName}`);
    } catch (err) {
        console.log(`Collection ${collectionName} does not exist. Skipping delete.`);
    }
    if (schema) {
        // Recreate the collection
        await sendTypeSenseRequest(`${typesenseUrl}/collections`, 'POST', apiKey, schema);
        console.log(`Recreated collection: ${collectionName}`);
    }
};

const bulkImportDocuments = async (
    typesenseUrl: string,
    apiKey: string,
    collectionName: string,
    documents: any[]
) => {
    const importUrl = `${typesenseUrl}/collections/${collectionName}/documents/import`;
    const documentsString = documents.map((doc) => JSON.stringify(doc)).join('\n');
    const response = await fetch(importUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'X-TYPESENSE-API-KEY': apiKey,
        },
        body: documentsString,
    });
    const result = await response.text();
    console.log(`Bulk import result for ${collectionName}:`, result);
};

const syncToTypesense = async (env: {
    TYPESENSE_ADMIN_API_KEY: string;
    TYPESENSE_URL: string;
    PULSE_API_KEY: string;
}) => {
    console.log('Starting syncToTypesense job...');
    try {
        const prisma = initPrismaClient();

        // Define schemas
        const organizationSchema = {
            name: 'organizations',
            fields: [
                { name: 'id', type: 'string', facet: false },
                { name: 'name', type: 'string', facet: false },
                { name: 'description', type: 'string', facet: false },
                { name: 'yearFounded', type: 'string', facet: false },
                { name: 'moneyRaised', type: 'int64', facet: false },
                { name: 'moneyDeployed', type: 'int64', facet: false },
            ],
        };
        const milestoneSchema = {
            name: 'milestones',
            fields: [
                { name: 'id', type: 'string', facet: false },
                { name: 'title', type: 'string', facet: false },
                { name: 'description', type: 'string', facet: false },
            ],
        };

        // Delete and recreate collections
        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'organizations', organizationSchema);
        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'milestones', milestoneSchema);

        // Fetch data from the database
        const organizations = await prisma.organization.findMany();
        const milestones = await prisma.milestone.findMany();

        console.log(`Fetched ${organizations.length} organizations and ${milestones.length} milestones from the database.`);

        // Bulk import data to TypeSense
        await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'organizations', organizations);
        await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'milestones', milestones);

        console.log('Sync job completed successfully.');
        return { status: 'success', message: 'Sync job completed successfully.' };
    } catch (error) {
        console.error('syncToTypesense job failed:', error);
        throw error;
    }
};

// Handle POST requests
export async function POST(req: Request) {
    try {
        const env = {
            TYPESENSE_ADMIN_API_KEY: process.env.TYPESENSE_ADMIN_API_KEY!,
            TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
            PULSE_API_KEY: process.env.PULSE_API_KEY!,
        };

        const result = await syncToTypesense(env);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error handling POST request:', error);

        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET() {
    try {
        const env = {
            TYPESENSE_ADMIN_API_KEY: process.env.TYPESENSE_ADMIN_API_KEY!,
            TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
            PULSE_API_KEY: process.env.PULSE_API_KEY!,
        };

        const result = await syncToTypesense(env);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error handling POST request:', error);

        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}