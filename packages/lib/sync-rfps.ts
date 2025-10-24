export const dynamic = 'force-dynamic'; // Prevent caching
import { checkDateRangeUTC } from "./utils";
import prisma from "./prisma"
import { RFP} from "./types";


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

const STATUS_PRIORITY = {
  'Open': 1,
  'Not Open': 2,
  'Closed': 3,
}

function getSortRank(rfp: RFP) {
    const status = checkDateRangeUTC(rfp?.startDate || undefined, rfp?.endDate || undefined)
    if (!status) return 0

    const base = STATUS_PRIORITY[status.status] * 1_000_000_000_000_000 // status weighting
    const now = new Date()

    if (status.status === 'Open') {
        // ascending by due_date → smaller date = higher rank
        if (rfp.endDate) return rfp.endDate.getTime()

        // if end date does not exist on this RFP put it at the end of the Open section
        return base
    }

    if (status.status === 'Not Open' && rfp.startDate) {
        // ascending by start_date
        return base + rfp.startDate.getTime()
    }

    if (status.status === 'Closed' && rfp.endDate) {
        // descending by due_date → larger date = higher rank
        return base + base - rfp.endDate.getTime()
    }

    return 0
}

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

        const lines = result.trim().split('\n');
        const failed = lines.filter((line) => {
            try {
                const parsed = JSON.parse(line);
                return parsed.success === false;
            } catch {
                return true;
            }
        });

        if (failed.length > 0) {
            console.error(`Failed to import ${failed.length} documents to ${collectionName}`);
            failed.forEach(f => console.error(f));
        } else {
            console.log(`All documents imported successfully to ${collectionName}`);
        }

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
        // Define schemas
        const rfpSchema = {
            name: 'rfps',
            enable_nested_fields: true,
            fields: [
                {
                    name: ".*",
                    type: "auto",
                },
                {
                    name: "condition.name",
                    type: "string",
                    sort: true,
                    optional: true
                },
                {
                    name: "organization.name",
                    type: "string",
                    sort: true,
                    optional: true,
                },
                {
                    name: "sort_rank",
                    type: "int64",
                    sort: true,
                    optional: false,
                }
                // {
                //     name: "gene.symbol",
                //     type: "string",
                //     sort: true,
                //     optional: true,
                // },
            ]
        }
        
        console.log(`RFPs`, JSON.stringify(rfpSchema, null, 2))
        await manageCollection(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'rfps', rfpSchema);

        const rfps = await prisma.rFP.findMany({
            where: {
                private: false // only sync public biosamples
            },
            select: {
                createdAt: true,
                // this list must include ALL items that allow sorting in the table
                // otherwise the sorting will not function
                organization: {
                    select: {
                        id: true,
                        name: true,
                        conditions: {
                            select: {
                                condition: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                id: true,
                title: true,
                description: true,
                eligibility: true,
                evaluationProcess: true,
                openTo: true,
                startDate: true,
                endDate: true
            }
        })

        console.log('Raw rfp data:', rfps)

        if (rfps.length > 0) {
            const uploadRFPs = rfps.map(rfp => ({
                ...rfp,
                createdAt: rfp.createdAt.getTime(), // special case for created at to enable sorting
                condition: rfp.organization?.conditions && rfp.organization.conditions.length > 0 && rfp.organization.conditions[0].condition,
                sort_rank: getSortRank(rfp as any)
            }))
            await bulkImportDocuments(env.TYPESENSE_URL, env.TYPESENSE_ADMIN_API_KEY, 'rfps', uploadRFPs);
        } else {
            console.log('No rfps to import.');
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
    TYPESENSE_ADMIN_API_KEY: (
        process.env.NEXT_PUBLIC_NODE_ENV === "production"
            ? process.env.TYPESENSE_ADMIN_API_KEY
            : process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY
    )!,
    TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
}).catch((error) => {
    console.error("Failed to initialize Typesense sync:", error);
});
