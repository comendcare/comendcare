// customerio-object-track.ts

const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_APP_ENV === "production";

type IdentifyObjectInput = {
    objectTypeId: string | number;
    objectId: string;
    attributes?: Record<string, any>;
    relationships?: Array<{
        identifiers: { id: string } | { email: string } | { cio_id: string } | { anonymous_id: string };
        relationshipAttributes?: Record<string, any>;
    }>;
};

export async function customerIOTrackObject(input: IdentifyObjectInput) {
    console.log("[CIO Object] called", {
        objectTypeId: String(input.objectTypeId),
        objectId: input.objectId,
        hasAttrs: Boolean(input.attributes && Object.keys(input.attributes).length),
        relCount: input.relationships?.length ?? 0,
        isProd,
        onServer: typeof window === "undefined",
    });

    if (!isProd) return { ok: true, skipped: true, reason: "not prod" as const };
    if (!input.objectId) return { ok: true, skipped: true, reason: "no objectId" as const };

    if (typeof window === "undefined") {
        // SERVER: call server util directly
        const { cioObjectIdentifyServer } = await import("./customer-io-objects");
        return cioObjectIdentifyServer(input);
    }

    // CLIENT: call an API route
    const res = await fetch("/api/cio/object/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify(input),
    });

    const data = await res.json().catch(() => ({ ok: res.ok }));
    return data;
}
