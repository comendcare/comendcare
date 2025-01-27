import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic'; // Prevent caching

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

export const syncToTypesense = async (env: {
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
            enable_nested_fields: true,
            fields: [
                { name: 'id', type: 'string', facet: false },
                { name: 'name', type: 'string', facet: true, sort: true, index: true },
                {
                    name: "description",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    name: "yearFounded",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    name: "moneyDeployed",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: true,
                    stem: false,
                    store: true,
                    type: "int64"
                },
                {
                    name: "moneyRaised",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: true,
                    stem: false,
                    store: true,
                    type: "int64"
                },
                {
                    name: "condition",
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "object[]"
                },
            ],
        };
        const milestoneSchema = {
            name: 'milestones',
            enable_nested_fields: true,
            fields: [
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "title",
                    optional: false,
                    sort: true,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "description",
                    optional: false,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "type",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "status",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "RFPId",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "RFP",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "object"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "RFPId_exists",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "bool"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "assetId",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "string"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "asset",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "object"
                },
                {
                    facet: false,
                    index: true,
                    infix: false,
                    locale: "",
                    name: "assetId_exists",
                    optional: true,
                    sort: false,
                    stem: false,
                    store: true,
                    type: "bool"
                }
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

            // map orgs to include all required data
            const uploadOrgs = await Promise.all(organizations.map(async (org, index) => {
                console.log(`Org ${index + 1}:`, org)
                const organization = await prisma.organization.findUnique({
                    where: { id: org.id },
                    include: { condition: {include: {condition: true}}}
                })
                
                return {
                    ...organization,
                    // prevalenceRatio: organization?.condition.flatMap(condition => condition.condition?.prevalenceRatio)
                }
            }))

            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'organizations', uploadOrgs);
        } else {
            console.log('No organizations to import.');
        }

        if (milestones.length > 0) {
            console.log('Validating milestone data...');

            const uploadMilestones = await Promise.all(milestones.map(async (ms, index) => {
                console.log(`Milestone ${index + 1}:`, ms)
                const milestone = await prisma.milestone.findUnique({
                    where: { id: ms.id },
                    include: {
                        RFP: true,
                        asset: true
                    }
                })

                return {
                    ...milestone,
                    RFPId_exists: milestone?.RFP ? true : false,
                    assetId_exists: milestone?.asset ? true : false,
                }
            }))

            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'milestones', uploadMilestones);
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

// Run sync on start - pull sync from app/api/sync/route.ts, this is the same sync we use for our global sync cron job
syncToTypesense({
    TYPESENSE_ADMIN_API_KEY: process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY!,
    TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
}).catch((error) => {
    console.error("Failed to initialize Typesense sync:", error);
});
