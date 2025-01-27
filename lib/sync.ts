import { syncToTypesense } from '@/app/api/sync/route';

export const dynamic = 'force-dynamic'; // Prevent caching

// Run sync on start - pull sync from app/api/sync/route.ts, this is the same sync we use for our global sync cron job
syncToTypesense({
    TYPESENSE_ADMIN_API_KEY: process.env.NEXT_PUBLIC_TYPESENSE_ADMIN_API_KEY!,
    TYPESENSE_URL: `https://${process.env.NEXT_PUBLIC_TYPESENSE_NODE!}`,
}).catch((error) => {
    console.error("Failed to initialize Typesense sync:", error);
});
