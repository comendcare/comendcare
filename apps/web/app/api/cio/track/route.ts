// app/api/cio/track/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {cioTrackServer} from "@/packages/lib/customer-io";

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
    try {
        const json = await req.json();
        const body = Body.parse(json);

        // Optional: basic origin check / auth if you like
        // const origin = req.headers.get('origin');

        const result = await cioTrackServer(body as any);

        // In non-prod we still return 200 so callers don’t branch everywhere
        return NextResponse.json(result);
    } catch (err: any) {
        if (!isProd) {
            console.error('CIO track error (dev)', err);
            return NextResponse.json({ ok: true, skipped: true, devError: String(err) });
        }
        console.error('CIO track error', err);
        return NextResponse.json({ ok: false, error: 'Bad Request' }, { status: 400 });
    }
}
