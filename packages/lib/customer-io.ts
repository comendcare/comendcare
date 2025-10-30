const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'production';

const CIO = {
    siteId: process.env.CUSTOMER_IO_WRITE_KEY ?? '',
    apiKey: process.env.CUSTOMER_IO_API_KEY ?? '',
    region: (process.env.CIO_REGION ?? 'us') as 'us' | 'eu',
};

const cioConfigured = Boolean(CIO.siteId && CIO.apiKey);

// Import lazily to avoid bundling into client
let _cio: any | null = null;

export function getCio() {
    if (!isProd) {
        console.log('[CIO] getCio: skipped (not production env)', {
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
        });
        return null;
    }
    if (!cioConfigured) {
        console.error('[CIO] getCio: missing config', {
            haveSiteId: Boolean(CIO.siteId),
            haveApiKey: Boolean(CIO.apiKey),
        });
        return null;
    }
    if (_cio) return _cio;

    try {
        // customerio-node >= v5 style exports
        const mod = require('customerio-node');
        const { TrackClient, RegionUS, RegionEU } = mod;

        if (typeof TrackClient !== 'function') {
            console.error('[CIO] customerio-node exports', Object.keys(mod || {}));
            throw new Error('TrackClient not found in customerio-node exports');
        }

        const region = CIO.region === 'eu' ? RegionEU : RegionUS;

        _cio = new TrackClient(CIO.siteId, CIO.apiKey, { region });

        console.log('[CIO] initialized (TrackClient)', {
            region: CIO.region,
            siteIdPreview: String(CIO.siteId).slice(0, 4) + '***',
            apiKeyPreview: String(CIO.apiKey).slice(0, 4) + '***',
        });
    } catch (err: any) {
        console.error('[CIO] failed to initialize SDK', {
            error: String(err?.message || err),
            stack: err?.stack,
        });
        return null;
    }

    return _cio;
}

/** Server-side track with best-effort identify+track + debug logs */
export async function cioTrackServer(input: {
    userId: string;
    event: string;
    properties?: Record<string, any>;
    timestamp?: Date | number;
    traits?: Record<string, any>;
}) {
    console.log('[CIO] track called', {
        event: input.event,
        userId: input.userId,
        hasProps: Boolean(input.properties && Object.keys(input.properties).length),
        hasTraits: Boolean(input.traits && Object.keys(input.traits).length),
        isProd,
        cioConfigured,
    });

    if (!isProd) {
        console.log('[CIO] skipped (not prod)');
        return { ok: true, skipped: true, reason: 'not prod' };
    }

    if (!cioConfigured) {
        console.error('[CIO] skipped (missing config)');
        return { ok: false, skipped: true, reason: 'no config' };
    }

    const cio = getCio();
    if (!cio) {
        console.error('[CIO] getCio returned null');
        return { ok: false, error: 'CIO not configured' };
    }

    const { userId, event, properties, timestamp, traits } = input;

    if (!userId) {
        console.error('[CIO] skipped (no userId provided)');
        return { ok: false, skipped: true, reason: 'no userId' };
    }

    const start = Date.now();

    try {
        console.log('[CIO] identify start', { userId, traits });
        await cio.identify(userId, traits && Object.keys(traits).length ? traits : {});
        console.log('[CIO] identify success', { ms: Date.now() - start });
    } catch (e: any) {
        console.error('[CIO] identify failed', e);
    }

    try {
        const ts =
            timestamp != null
                ? Math.floor(new Date(timestamp).getTime() / 1000)
                : undefined;

        console.log('[CIO] track start', {
            event,
            timestamp: ts,
            dataPreview: properties ? JSON.stringify(properties).slice(0, 200) : '{}',
        });

        await cio.track(userId, {
            name: event,
            data: properties ?? {},
            timestamp: ts,
        });

        console.log('[CIO] track success', {
            event,
            ms: Date.now() - start,
        });

        return { ok: true };
    } catch (err: any) {
        console.error('[CIO] track failed', {
            event,
            error: err?.message,
            stack: err?.stack,
        });
        return { ok: false, error: err?.message };
    }
}
