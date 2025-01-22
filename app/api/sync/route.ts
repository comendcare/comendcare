import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const initPrismaClient = () => {
    console.log('Initializing Prisma client...');
    const client = new PrismaClient();
    console.log('Prisma client initialized.');
    return client;
};

const sendTypeSenseRequest = async (
    url: string,
    method: string,
    apiKey: string,
    data?: any
) => {
    const headers = {
        'Content-Type': 'application/json',
        'X-TYPESENSE-API-KEY': apiKey,
    };
    const body = data ? JSON.stringify(data) : undefined;

    console.log(`Sending TypeSense request: ${method} ${url}`);
    if (data) console.log('Request payload:', JSON.stringify(data, null, 2));

    try {
        const response = await fetch(url, { method, headers, body });
        const responseData = await response.json();
        console.log(`Response from TypeSense (${method} ${url}):`, responseData);
        return responseData;
    } catch (error) {
        console.error(`Error in TypeSense request (${method} ${url}):`, error);
        throw error;
    }
};

const manageCollection = async (
    typesenseUrl: string,
    apiKey: string,
    collectionName: string,
    schema?: any
) => {
    const collectionUrl = `${typesenseUrl}/collections/${collectionName}`;
    try {
        console.log(`Attempting to delete collection: ${collectionName}`);
        await sendTypeSenseRequest(collectionUrl, 'DELETE', apiKey);
        console.log(`Deleted existing collection: ${collectionName}`);
    } catch (err) {
        if (err instanceof Error) {
            console.log(`Collection ${collectionName} does not exist or deletion failed:`, err.message);
        } else {
            console.log(`Collection ${collectionName} does not exist or deletion failed with unknown error:`, err);
        }
    }

    if (schema) {
        console.log(`Creating collection: ${collectionName} with schema:`, JSON.stringify(schema, null, 2));
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

    console.log(`Importing ${documents.length} documents to collection: ${collectionName}`);
    console.log('Documents being imported:', documents);

    try {
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
    } catch (error) {
        console.error(`Error during bulk import for ${collectionName}:`, error);
        throw error;
    }
};

const syncToTypesense = async (env: {
    TYPESENSE_ADMIN_API_KEY: string;
    TYPESENSE_URL: string;
}) => {
    console.log('Starting syncToTypesense job...');
    console.log('Environment variables:', env);

    try {
        const prisma = initPrismaClient();

        // Define schemas
        const organizationSchema = {
            name: 'organizations',
            fields: [
                { name: 'id', type: 'string', facet: false },
                { name: 'name', type: 'string', facet: false },
                { name: 'moneyDeployed', type: 'float', facet: true },
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

        console.log('Organization Schema:', JSON.stringify(organizationSchema, null, 2));
        console.log('Milestone Schema:', JSON.stringify(milestoneSchema, null, 2));

        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'organizations', organizationSchema);
        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'milestones', milestoneSchema);

        const organizations = await prisma.organization.findMany();
        const milestones = await prisma.milestone.findMany();

        console.log('Raw organizations data:', organizations);
        console.log('Raw milestones data:', milestones);

        if (organizations.length > 0) {
            console.log('Validating organization data...');
            organizations.forEach((org, idx) => console.log(`Org ${idx + 1}:`, org));
            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'organizations', organizations);
        } else {
            console.log('No organizations to import.');
        }

        if (milestones.length > 0) {
            console.log('Validating milestone data...');
            milestones.forEach((ms, idx) => console.log(`Milestone ${idx + 1}:`, ms));
            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'milestones', milestones);
        } else {
            console.log('No milestones to import.');
        }

        console.log('Sync job completed successfully.');
        return { status: 'success', message: 'Sync job completed successfully.' };
    } catch (error) {
        console.error('syncToTypesense job failed:', error);
        throw error;
    }
};

export async function POST(req: Request) {
    try {
        const env = {
            TYPESENSE_ADMIN_API_KEY: process.env.TYPESENSE_ADMIN_API_KEY!,
            TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
        };

        const result = await syncToTypesense(env);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            console.error('Unexpected error type:', error);
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function GET() {
    try {
        const env = {
            TYPESENSE_ADMIN_API_KEY: process.env.TYPESENSE_ADMIN_API_KEY!,
            TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
        };

        const result = await syncToTypesense(env);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else {
            console.error('Unexpected error type:', error);
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
