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
    console.log('[CIO Track] called', {
        event: input.event,
        userId: input.userId,
        hasProps: !!input.properties && Object.keys(input.properties).length > 0,
        hasTraits: !!input.traits && Object.keys(input.traits).length > 0,
        isProd,
        env: {
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
        },
        onServer: typeof window === 'undefined',
    });

    // Silently no-op if we lack a userId or we’re not in prod
    if (!isProd) {
        console.log('[CIO Track] skipped (not production)');
        return { ok: true, skipped: true, reason: 'not prod' };
    }
    if (!input.userId) {
        console.warn('[CIO Track] skipped (no userId)');
        return { ok: true, skipped: true, reason: 'no userId' };
    }

    if (typeof window === 'undefined') {
        // SERVER: call server util directly
        try {
            const { cioTrackServer } = await import('./customer-io');
            console.log('[CIO Track] using server-side cioTrackServer');
            const res = await cioTrackServer({
                userId: input.userId!,
                event: input.event,
                properties: input.properties,
                timestamp: input.timestamp,
                traits: input.traits,
            });
            console.log('[CIO Track] server result', res);
            return res;
        } catch (err: any) {
            console.error('[CIO Track] server call failed', err);
            return { ok: false, error: String(err) };
        }
    } else {
        // CLIENT: hit our API route (Node SDK runs on server)
        try {
            console.log('[CIO Track] sending to /api/cio/track', {
                path: '/api/cio/track',
                event: input.event,
                timestamp: input.timestamp ?? Date.now(),
            });

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

            const data = await res.json().catch(() => ({ ok: true }));
            console.log('[CIO Track] client response', {
                status: res.status,
                ok: res.ok,
                body: data,
            });
            return data;
        } catch (err: any) {
            console.error('[CIO Track] client fetch failed', err);
            return { ok: true, skipped: true, error: String(err) };
        }
    }
}
