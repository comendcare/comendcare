// We’ll directly call the server function if we’re already on the server,

const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'production';

type Input = {
    userId?: string | null;
    event: string;
    properties?: Record<string, any>;
    timestamp?: Date | number;
    traits?: Record<string, any>; // e.g., { email, name }
};

export async function customerIOTrack(input: Input) {
    // Silently no-op if we lack a userId or we’re not in prod
    if (!isProd || !input.userId) return { ok: true, skipped: true };

    if (typeof window === 'undefined') {
        // SERVER: call server util directly
        const { cioTrackServer } = await import('./customer-io');
        return cioTrackServer({
            userId: input.userId!,
            event: input.event,
            properties: input.properties,
            timestamp: input.timestamp,
            traits: input.traits,
        });
    } else {
        // CLIENT: hit our API route (Node SDK runs on server)
        try {
            const res = await fetch('/api/cio/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                keepalive: true,
                body: JSON.stringify({
                    userId: input.userId,
                    event: input.event,
                    properties: input.properties,
                    timestamp: input.timestamp ?? Date.now(),
                    traits: input.traits,
                }),
            });
            // do not throw on non-2xx; keep it best-effort
            return await res.json().catch(() => ({ ok: true }));
        } catch {
            return { ok: true, skipped: true };
        }
    }
}
