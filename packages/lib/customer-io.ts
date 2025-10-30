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
    if (!isProd || !cioConfigured) return null;
    if (_cio) return _cio;

    // customerio-node is ESM in some setups; do a dynamic require/import
    // If your project is ESM, change this to: const { CustomerIO } = await import('customerio-node')
    // @ts-ignore
    const { CustomerIO } = require('customerio-node');

    _cio = new CustomerIO(CIO.siteId, CIO.apiKey, {
        // region: 'US'|'EU' depending on the SDK—map our env to what the lib expects
        region: CIO.region === 'eu' ? 'EU' : 'US',
        // optional: timeout, retries, etc.
    });
    return _cio;
}

/** Server-side track with best-effort identify+track */
export async function cioTrackServer(input: {
    userId: string;
    event: string;
    properties?: Record<string, any>;
    timestamp?: Date | number;
    traits?: Record<string, any>; // optional: name/email, etc.
}) {
    if (!isProd || !cioConfigured) return { ok: true, skipped: true };

    const cio = getCio();
    if (!cio) return { ok: false, error: 'CIO not configured' };

    const { userId, event, properties, timestamp, traits } = input;

    // 1) Identify/update person (idempotent)
    if (traits && Object.keys(traits).length) {
        await cio.identify(userId, traits);
    } else {
        // At minimum, ensure the profile exists (optional but nice)
        await cio.identify(userId, {});
    }

    // 2) Track event
    await cio.track(userId, {
        name: event,
        data: properties ?? {},
        timestamp: timestamp ? Math.floor(new Date(timestamp).getTime() / 1000) : undefined, // seconds
    });

    return { ok: true };
}
