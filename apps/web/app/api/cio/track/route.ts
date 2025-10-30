// app/api/cio/track/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cioTrackServer } from '@/packages/lib/customer-io';

const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'production';

const Body = z.object({
    userId: z.string().min(1),
    event: z.string().min(1),
    properties: z.record(z.any()).optional(),
    timestamp: z.union([z.number(), z.string(), z.date()]).optional(),
    traits: z.record(z.any()).optional(), // e.g. { email, name }
});

export async function POST(req: Request) {
    const rid = Math.random().toString(36).slice(2, 10); // short request id for correlation
    const start = Date.now();

    try {
        // log inbound request basics
        const headers = {
            origin: req.headers.get('origin'),
            'content-type': req.headers.get('content-type'),
        };
        console.log('[CIO API]', rid, 'incoming request', {
            headers,
            method: req.method,
            url: req.url,
        });

        const json = await req.json().catch((e) => {
            console.error('[CIO API]', rid, 'failed to parse JSON body', e);
            return {};
        });

        console.log('[CIO API]', rid, 'raw body received', {
            keys: Object.keys(json || {}),
            size: JSON.stringify(json || {}).length,
        });

        const body = Body.parse(json);
        console.log('[CIO API]', rid, 'validated body', {
            userId: body.userId,
            event: body.event,
            hasProps: !!body.properties && Object.keys(body.properties).length > 0,
            hasTraits: !!body.traits && Object.keys(body.traits).length > 0,
            timestampType:
                body.timestamp === undefined ? 'none' : typeof body.timestamp,
        });

        const result = await cioTrackServer(body as any);
        console.log('[CIO API]', rid, 'cioTrackServer result', {
            result,
            durationMs: Date.now() - start,
        });

        // In non-prod we still return 200 so callers don’t branch everywhere
        return NextResponse.json(result);
    } catch (err: any) {
        const duration = Date.now() - start;
        if (!isProd) {
            console.error('[CIO API]', 'error (dev)', err);
            return NextResponse.json({
                ok: true,
                skipped: true,
                devError: String(err),
                durationMs: duration,
            });
        }
        console.error('[CIO API]', 'error', {
            error: String(err?.message || err),
            stack: err?.stack,
            durationMs: duration,
        });
        return NextResponse.json(
            { ok: false, error: 'Bad Request' },
            { status: 400 },
        );
    }
}
