import { NextResponse } from 'next/server';
import {PrismaClient} from '@prisma/client';
import {withPulse} from '@prisma/extension-pulse/node';

// Initialize Prisma Client with PostgreSQL adapter
const initPrismaClient = () => {
    return new PrismaClient()
};

// Helper function to send requests to TypeSense
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
    const response = await fetch(url, {method, headers, body});
    return response?.json() ?? null;
};

// TypeSense collection management
const createTypeSenseCollection = async (
    typesenseUrl: string,
    apiKey: string,
    data: any,
) => {
    const url = `${typesenseUrl}/collections`;
    return sendTypeSenseRequest(url, 'POST', apiKey, data);
};

const deleteTypeSenseCollection = async (
    typesenseUrl: string,
    apiKey: string,
    data: any,
) => {
    const url = `${typesenseUrl}/collections`;
    return sendTypeSenseRequest(url, 'POST', apiKey, data);
}

const addTypeSenseDocument = async (
    typesenseUrl: string,
    apiKey: string,
    data: any,
    documentType: string
) => {
    const url = `${typesenseUrl}/collections/${documentType}/documents`;
    return sendTypeSenseRequest(url, 'POST', apiKey, data);
};

const updateTypeSenseDocument = async (
    typesenseUrl: string,
    apiKey: string,
    data: any,
    documentType: string
) => {
    const url = `${typesenseUrl}/collections/${documentType}/documents/${data.id}`;
    return sendTypeSenseRequest(url, 'PATCH', apiKey, data);
};

const deleteTypeSenseDocument = async (
    typesenseUrl: string,
    apiKey: string,
    id: string,
    documentType: string
) => {
    const url = `${typesenseUrl}/collections/${documentType}/documents/${id}`;
    return sendTypeSenseRequest(url, 'DELETE', apiKey);
};

// Extend Prisma Client with Pulse extension
const addPulseExtension = (
    db: PrismaClient,
    pulseAPIKey: string,
) => {
    return db.$extends(
        withPulse({
            apiKey: pulseAPIKey,
        })
    );
};

// Main sync function
const syncToTypesense = async (env: {
    DATABASE_URL: string,
    TYPESENSE_ADMIN_API_KEY: string,
    TYPESENSE_URL: string,
    PULSE_API_KEY: string
}) => {
    console.log('Starting syncToTypesense job...');
    let orgStream: any
    let milestoneStream: any

    try {
        // Initialize Prisma and extend with Pulse
        const prisma = addPulseExtension(initPrismaClient(), env.PULSE_API_KEY);
        console.log(`Added prisma pulse extension...`)

        // Ensure TypeSense organization collection exists
        await createTypeSenseCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, {
            name: 'organizations',
            "fields": [
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "description",
                    "optional": false,
                    "sort": false,
                    "stem": false,
                    "store": true,
                    "type": "string"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "yearFounded",
                    "optional": false,
                    "sort": false,
                    "stem": false,
                    "store": true,
                    "type": "string"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "name",
                    "optional": false,
                    "sort": true,
                    "stem": false,
                    "store": true,
                    "type": "string"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "moneyRaised",
                    "optional": false,
                    "sort": true,
                    "stem": false,
                    "store": true,
                    "type": "int64"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "numberOfIdentifiedPatients",
                    "optional": false,
                    "sort": true,
                    "stem": false,
                    "store": true,
                    "type": "int64"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "prevalenceDenominator",
                    "optional": false,
                    "sort": true,
                    "stem": false,
                    "store": true,
                    "type": "int64"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "prevalenceNumerator",
                    "optional": false,
                    "sort": true,
                    "stem": false,
                    "store": true,
                    "type": "int64"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "prevalenceRatio",
                    "optional": true,
                    "sort": true,
                    "stem": false,
                    "store": true,
                    "type": "float"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "moneyDeployed",
                    "optional": false,
                    "sort": true,
                    "stem": false,
                    "store": true,
                    "type": "int64"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "interestedModalities",
                    "optional": true,
                    "sort": false,
                    "stem": false,
                    "store": true,
                    "type": "string[]"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "diseaseCategories",
                    "optional": true,
                    "sort": false,
                    "stem": false,
                    "store": true,
                    "type": "string[]"
                }
                // add additional fields as needed
            ],
        });
        console.log(`Created typesense organizations collection...`)

        await createTypeSenseCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, {
            name: 'milestones',
            "fields": [
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "title",
                    "optional": false,
                    "sort": true,
                    "stem": false,
                    "store": true,
                    "type": "string"
                },
                {
                    "facet": false,
                    "index": true,
                    "infix": false,
                    "locale": "",
                    "name": "description",
                    "optional": false,
                    "sort": false,
                    "stem": false,
                    "store": true,
                    "type": "string"
                },
                // add additional fields as needed
            ],
        });
        console.log(`Created typesense milestones collection...`)

        // Stream organization changes
        orgStream = await prisma.organization.stream({name: 'organization-events'});
        milestoneStream = await prisma.milestone.stream({name: 'milestone-events'});

        process.on('exit', () => {
            orgStream.stop();
            milestoneStream.stop();
        });

        // const FIVE_MINUTES = 5 * 60 * 1000;
        // let timeoutId: NodeJS.Timeout;
        //
        // const resetTimeout = () => {
        //     if (timeoutId) {
        //         clearTimeout(timeoutId);
        //     }
        //     timeoutId = setTimeout(() => {
        //         console.log('No events for 5 minutes. Terminating stream.');
        //         orgStream.stop();
        //         milestoneStream.stop();
        //         throw Error('Stream terminated due to inactivity');
        //     }, FIVE_MINUTES);
        // };
        //
        // resetTimeout();

        const handleOrgStream = async () => {
            for await (const event of orgStream) {
                // resetTimeout();
                console.log(`handle organization event`, event);
                try {
                    switch (event.action) {
                        case 'create':
                            console.log("Syncing created organization to Typesense:", event.created);
                            await addTypeSenseDocument(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, event.created, 'organizations');
                            break;
                        case 'update':
                            console.log("Syncing updated organization to Typesense:", event.after);
                            await updateTypeSenseDocument(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, event.after, 'organizations');
                            break;
                        case 'delete':
                            console.log("Deleting organization from Typesense:", event.deleted);
                            await deleteTypeSenseDocument(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, event.deleted.id, 'organizations');
                            break;
                    }
                } catch (error) {
                    console.error("Error processing event for Typesense:", error);
                }
            }
        };

        const handleMilestoneStream = async () => {
            for await (const event of milestoneStream) {
                // resetTimeout();
                console.log(`handle milestone event`, event);
                try {
                    switch (event.action) {
                        case 'create':
                            console.log("Syncing created milestone to Typesense:", event.created);
                            await addTypeSenseDocument(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, event.created, 'milestones');
                            break;
                        case 'update':
                            console.log("Syncing updated milestone to Typesense:", event.after);
                            await updateTypeSenseDocument(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, event.after, 'milestones');
                            break;
                        case 'delete':
                            console.log("Deleting milestone from Typesense:", event.deleted);
                            await deleteTypeSenseDocument(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, event.deleted.id, 'milestones');
                            break;
                    }
                } catch (error) {
                    console.error("Error processing event for Typesense:", error);
                }
            }
        };

        // Run both streams concurrently
        Promise.all([handleOrgStream(), handleMilestoneStream()])
            .catch((err) => console.error('Stream error:', err));

        console.log('Sync job completed successfully.');
        return { status: 'success', message: 'Sync job completed successfully.' };
    } catch (error) {
        console.error('syncToTypesense job failed:', error);
        throw error;
    } finally {
        if (orgStream) orgStream.stop();
        if (milestoneStream) milestoneStream.stop();
    }
};

// Handle POST requests
export async function POST(req: Request) {
    try {
        const env = {
            DATABASE_URL: process.env.DATABASE_URL!,
            TYPESENSE_ADMIN_API_KEY: process.env.TYPESENSE_ADMIN_API_KEY!,
            TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
            PULSE_API_KEY: process.env.PULSE_API_KEY!,
        };

        const result = await syncToTypesense(env);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error handling POST request:', error);

        // Narrow down the error type
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// Optionally handle GET requests
export async function GET() {
    try {
        const env = {
            DATABASE_URL: process.env.DATABASE_URL!,
            TYPESENSE_ADMIN_API_KEY: process.env.TYPESENSE_ADMIN_API_KEY!,
            TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
            PULSE_API_KEY: process.env.PULSE_API_KEY!,
        };

        const result = await syncToTypesense(env);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error handling GET request:', error);

        // Narrow down the error type
        let errorMessage = 'An unexpected error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}