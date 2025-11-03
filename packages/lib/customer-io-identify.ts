import { getCio } from './customer-io'; // your existing file

const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'production';


type Traits = {
    email?: string | null;
    name?: string | null;
    created_at?: number | Date; // seconds or Date
    organization_id?: string | null;
    organization_name?: string | null;
    organization_subdomain?: string | null;
    marketing_opt_in?: boolean;
    role?: string | null;
    plan?: string | null;
};

export async function cioIdentify(userId: string, traits: Traits = {}) {
    if (!isProd || !userId) return { ok: true, skipped: true };

    const cio = getCio();
    if (!cio) return { ok: false, error: 'CIO not configured' };

    const payload: Record<string, any> = { ...traits };

    // normalize created_at to seconds epoch if it's a Date
    if (payload.created_at instanceof Date) {
        payload.created_at = Math.floor(payload.created_at.getTime() / 1000);
    }

    try {
        await cio.identify(userId, payload);
        return { ok: true };
    } catch (e: any) {
        console.error('[CIO] identify (explicit) failed', { userId, error: String(e?.message || e) });
        return { ok: false, error: String(e?.message || e) };
    }
}
