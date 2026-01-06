// customer-io-objects.ts
// SERVER-ONLY: uses fetch + Basic Auth to Track API v2 (Custom Objects)

const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_APP_ENV === "production";

const CIO = {
    siteId: process.env.CIO_TRACK_SITE_ID ?? "",
    apiKey: process.env.CIO_TRACK_API_KEY ?? "",
    region: (process.env.CIO_REGION ?? "us") as "us" | "eu",
};

const cioConfigured = Boolean(CIO.siteId && CIO.apiKey);

function trackBaseUrl() {
    return CIO.region === "eu"
        ? "https://track-eu.customer.io/api"
        : "https://track.customer.io/api";
}

function authHeader() {
    const token = Buffer.from(`${CIO.siteId}:${CIO.apiKey}`).toString("base64");
    return `Basic ${token}`;
}

// --- Types (you can tighten these later) ---
export type PersonIdentifiers =
    | { id: string }
    | { email: string }
    | { cio_id: string }
    | { anonymous_id: string };

export type ObjectIdentifiers =
    | { object_type_id: string; object_id: string }
    | { cio_object_id: string };

export type ObjectAction =
    | "identify"
    | "delete"
    | "add_relationships"
    | "remove_relationships"
    | "replace_relationships"
    | "identify_anonymous";

export type CioObjectEntity = {
    type: "object";
    action: ObjectAction;
    identifiers: ObjectIdentifiers;
    attributes?: Record<string, any>;
    cio_relationships?: Array<{
        identifiers: PersonIdentifiers;
        relationship_attributes?: Record<string, any>;
    }>;
};

function safeJson(text: string) {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

async function cioV2Post(path: "/v2/entity" | "/v2/batch", body: any) {
    console.log("[CIO:v2] called", {
        path,
        isProd,
        cioConfigured,
        region: CIO.region,
        bodyPreview: JSON.stringify(body).slice(0, 300),
    });

    if (!isProd) {
        console.log("[CIO:v2] skipped (not prod)");
        return { ok: true, skipped: true, reason: "not prod" as const };
    }

    if (!cioConfigured) {
        console.error("[CIO:v2] skipped (missing config)", {
            haveSiteId: Boolean(CIO.siteId),
            haveApiKey: Boolean(CIO.apiKey),
        });
        return { ok: false, skipped: true, reason: "no config" as const };
    }

    const url = `${trackBaseUrl()}${path}`;
    const start = Date.now();

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: authHeader(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const text = await res.text();
        const ms = Date.now() - start;

        if (!res.ok) {
            console.error("[CIO:v2] failed", {
                path,
                status: res.status,
                ms,
                responsePreview: text.slice(0, 500),
            });
            return { ok: false, status: res.status, error: text };
        }

        console.log("[CIO:v2] success", { path, status: res.status, ms });
        return { ok: true, status: res.status, data: text ? safeJson(text) : null };
    } catch (err: any) {
        console.error("[CIO:v2] error", {
            path,
            error: String(err?.message || err),
            stack: err?.stack,
        });
        return { ok: false, error: String(err?.message || err) };
    }
}

/** Identify (create/update) a custom object */
export async function cioObjectIdentifyServer(input: {
    objectTypeId: string | number;
    objectId: string;
    attributes?: Record<string, any>;
    relationships?: Array<{
        identifiers: PersonIdentifiers;
        relationshipAttributes?: Record<string, any>;
    }>;
}) {
    const entity: CioObjectEntity = {
        type: "object",
        action: "identify",
        identifiers: {
            object_type_id: String(input.objectTypeId),
            object_id: input.objectId,
        },
        attributes: input.attributes ?? {},
        cio_relationships: input.relationships?.map((r) => ({
            identifiers: r.identifiers,
            relationship_attributes: r.relationshipAttributes,
        })),
    };

    return cioV2Post("/v2/entity", entity);
}

/** Delete a custom object */
export async function cioObjectDeleteServer(input: {
    objectTypeId: string | number;
    objectId: string;
}) {
    const entity: CioObjectEntity = {
        type: "object",
        action: "delete",
        identifiers: {
            object_type_id: String(input.objectTypeId),
            object_id: input.objectId,
        },
    };

    return cioV2Post("/v2/entity", entity);
}

/** Manage relationships without changing attributes */
export async function cioObjectRelationshipsServer(input: {
    action: "add_relationships" | "remove_relationships" | "replace_relationships";
    objectTypeId: string | number;
    objectId: string;
    relationships: Array<{
        identifiers: PersonIdentifiers;
        relationshipAttributes?: Record<string, any>;
    }>;
}) {
    const entity: CioObjectEntity = {
        type: "object",
        action: input.action,
        identifiers: {
            object_type_id: String(input.objectTypeId),
            object_id: input.objectId,
        },
        cio_relationships: input.relationships.map((r) => ({
            identifiers: r.identifiers,
            relationship_attributes: r.relationshipAttributes,
        })),
    };

    return cioV2Post("/v2/entity", entity);
}

/** Batch multiple object operations (good for backfills) */
export async function cioObjectBatchServer(entities: CioObjectEntity[]) {
    return cioV2Post("/v2/batch", { batch: entities });
}
