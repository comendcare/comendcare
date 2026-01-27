// scripts/backfill-cio-orgs.ts
import "dotenv/config";
import prisma from "@comend/lib/prisma";
import { cioObjectBatchServer } from "@comend/lib/customerio/customer-io-objects";
import { getCio } from "@comend/lib/customerio/customer-io"; // <-- your TrackClient wrapper

const PAG_OBJECT_TYPE_ID = 1;
const BATCH_SIZE = 100;
const USER_CONCURRENCY = 25;

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

function toEpochSeconds(d?: Date | null) {
    return d ? Math.floor(d.getTime() / 1000) : undefined;
}

async function mapPool<T, R>(
    items: T[],
    concurrency: number,
    fn: (item: T, i: number) => Promise<R>
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let idx = 0;

    await Promise.all(
        new Array(Math.min(concurrency, items.length)).fill(null).map(async () => {
            while (true) {
                const i = idx++;
                if (i >= items.length) return;
                results[i] = await fn(items[i], i);
            }
        })
    );

    return results;
}

async function backfillUsers(userIds: string[]) {
    const cio = getCio();
    if (!cio) throw new Error("Customer.io TrackClient not configured (getCio returned null)");

    // Pull minimal user traits you care about
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            notificationSettings: true,
            consentSettings: true,
            country: true,
        },
    });

    console.log(`Identifying ${users.length} users into Customer.io...`);

    const results = await mapPool(users, USER_CONCURRENCY, async (u) => {
        try {
            // IMPORTANT: this sets the person identifier "id" to your User.id
            await cio.identify(u.id, {
                email: u.email ?? undefined,
                name: u.name ?? undefined,
                created_at: toEpochSeconds(u.createdAt),
                notification_settings: u.notificationSettings,
                consent_settings: u.consentSettings,
                country: u.country ?? undefined,
            });
            return { ok: true };
        } catch (e: any) {
            return { ok: false, error: String(e?.message || e), userId: u.id };
        }
    });

    const fail = results.filter((r: any) => !r.ok);
    if (fail.length) {
        console.error(`User identify failures: ${fail.length}`);
        console.error(fail.slice(0, 10));
    } else {
        console.log("All users identified successfully.");
    }
}

async function backfillOrgsAndRelationships() {
    const orgs = await prisma.organization.findMany({
        where: { subdomain: { not: null } },
        select: {
            id: true,
            subdomain: true,
            name: true,
            description: true,
            website: true,
            verified: true,
            published: true,
            public: true,
            country: true,
            createdAt: true,
            updatedAt: true,
            members: {
                select: {
                    userId: true,
                    role: true,
                    title: true,
                    createdAt: true,
                },
            },
        },
    });

    console.log(`Found ${orgs.length} orgs with subdomain`);

    // --- Collect all member userIds for user backfill ---
    const memberUserIds = Array.from(
        new Set(
            orgs
                .flatMap((o) => o.members.map((m) => m.userId))
                .filter(Boolean)
        )
    ) as string[];

    await backfillUsers(memberUserIds);

    // --- Build v2 entities for objects + relationships ---
    const entities = orgs.flatMap((org) => {
        const objectId = (org.subdomain ?? "").trim();
        if (!objectId) return [];

        const identifyObject = {
            type: "object" as const,
            action: "identify" as const,
            identifiers: {
                object_type_id: String(PAG_OBJECT_TYPE_ID),
                object_id: objectId,
            },
            attributes: {
                subdomain: objectId,
                name: org.name ?? null,
                description: org.description ?? null,
                website: org.website ?? null,
                verified: Boolean(org.verified),
                published: Boolean(org.published),
                public: Boolean(org.public),
                country: org.country ?? null,
                created_at: toEpochSeconds(org.createdAt),
                updated_at: toEpochSeconds(org.updatedAt),
            },
        };

        const addRelationships = {
            type: "object" as const,
            action: "add_relationships" as const,
            identifiers: {
                object_type_id: String(PAG_OBJECT_TYPE_ID),
                object_id: objectId,
            },
            cio_relationships: org.members
                .filter((m) => m.userId)
                .map((m) => ({
                    identifiers: { id: m.userId },
                })),
        };

        return [identifyObject, addRelationships];
    });

    console.log(`Prepared ${entities.length} v2 entities`);

    const batches = chunk(entities, BATCH_SIZE);
    let ok = 0;
    let fail = 0;

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const res = await cioObjectBatchServer(batch as any);

        if (res.ok) {
            ok++;
            console.log(`Batch ${i + 1}/${batches.length}: OK (${batch.length} entities)`);
        } else {
            fail++;
            console.error(`Batch ${i + 1}/${batches.length}: FAIL`, res);
        }
    }

    console.log(`Done. OK batches: ${ok}, failed batches: ${fail}`);
}

async function main() {
    await backfillOrgsAndRelationships();
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
