import {
    cioObjectIdentifyServer,
    cioObjectRelationshipsServer,
} from "./customer-io-objects";

const PAG_OBJECT_TYPE_ID = process.env.CIO_PAG_OBJECT_TYPE_ID ?? "";

export async function cioSyncOrg(org: {
    subdomain: string | null;
    name?: string | null;
    description?: string | null;
}) {
    if (!PAG_OBJECT_TYPE_ID) return { ok: false, error: "Missing CIO_PAG_OBJECT_TYPE_ID" };
    const objectId = (org.subdomain ?? "").trim();
    if (!objectId) return { ok: true, skipped: true, reason: "no subdomain" as const };

    return cioObjectIdentifyServer({
        objectTypeId: PAG_OBJECT_TYPE_ID,
        objectId,
        attributes: {
            subdomain: objectId,
            name: org.name ?? null,
            description: org.description ?? null,
        },
    });
}

/**
 * Upsert = ensure the user is related to the org AND the relationship attrs are current.
 * Uses replace_relationships so role/joined_at get updated deterministically.
 */
export async function cioUpsertOrgMember(params: {
    orgSubdomain: string;
    userId: string;
    role?: string | null;
    joinedAt?: Date;
    title?: string | null;
}) {
    if (!PAG_OBJECT_TYPE_ID) return { ok: false, error: "Missing CIO_PAG_OBJECT_TYPE_ID" };

    const objectId = (params.orgSubdomain ?? "").trim();
    if (!objectId) return { ok: true, skipped: true, reason: "no subdomain" as const };
    if (!params.userId) return { ok: true, skipped: true, reason: "no userId" as const };

    // Optional but safe: ensure object exists (idempotent)
    await cioObjectIdentifyServer({
        objectTypeId: PAG_OBJECT_TYPE_ID,
        objectId,
        attributes: { subdomain: objectId },
    });

    return cioObjectRelationshipsServer({
        action: "replace_relationships",
        objectTypeId: PAG_OBJECT_TYPE_ID,
        objectId,
        relationships: [
            {
                identifiers: { id: params.userId },
                relationshipAttributes: {
                    role: params.role ?? undefined,
                    title: params.title ?? undefined,
                    joined_at: params.joinedAt
                        ? Math.floor(params.joinedAt.getTime() / 1000)
                        : undefined,
                },
            },
        ],
    });
}

// Keep this if you want a dedicated “remove”
export async function cioRemoveOrgMember(params: { orgSubdomain: string; userId: string }) {
    if (!PAG_OBJECT_TYPE_ID) return { ok: false, error: "Missing CIO_PAG_OBJECT_TYPE_ID" };

    const objectId = (params.orgSubdomain ?? "").trim();
    if (!objectId) return { ok: true, skipped: true, reason: "no subdomain" as const };
    if (!params.userId) return { ok: true, skipped: true, reason: "no userId" as const };

    return cioObjectRelationshipsServer({
        action: "remove_relationships",
        objectTypeId: PAG_OBJECT_TYPE_ID,
        objectId,
        relationships: [{ identifiers: { id: params.userId } }],
    });
}
