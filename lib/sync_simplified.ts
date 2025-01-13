import { PrismaClient } from '@prisma/client';
import { withPulse } from '@prisma/extension-pulse/node';
import { typesense } from '@/lib/typesense';

process.on('SIGINT', () => {
    process.exit(0)
})

const PULSE_API_KEY = (() => {
    const key = process.env.NEXT_PUBLIC_NODE_ENV === 'development'
        ? process.env.PREVIEW_PULSE_API_KEY
        : process.env.PRODUCTION_PULSE_API_KEY;

    if (!key) {
        throw new Error('PULSE_API_KEY is not defined. Please check your environment variables.');
    }

    return key;
})()

// Initialize Prisma Client with Pulse extension
export const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
}).$extends(
    withPulse({
        apiKey: PULSE_API_KEY,
    })
);

export async function syncToTypesense() {
    try {
        // Stream organization changes
        const orgStream = await prisma.organization.stream({ name: 'organization-events' });

        process.on('exit', (code) => {
            orgStream.stop()
        })

        // Process each event and sync with Typesense
        for await (const event of orgStream) {
            switch (event.action) {
                case 'create':
                    await typesense.collections('organizations').documents().create(event.created);
                    break;
                case 'update':
                    await typesense.collections('organizations').documents(event.after.id).update(event.after);
                    break;
                case 'delete':
                    await typesense.collections('organizations').documents(event.deleted.id).delete();
                    break;
            }
            console.log(event)
        }
    } catch (error: any) {
        if (error.code === 'P6100') {
            console.error("A stream is already active. Only one active stream is allowed per name.");
        } else {
            console.error("Error syncing with Typesense:", error);
        }
    }
}

syncToTypesense().catch((error) => {
    console.error("Failed to initialize Typesense sync:", error);
});
