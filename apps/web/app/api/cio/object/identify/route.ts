// app/api/cio/object/identify/route.ts
import { NextResponse } from "next/server";
import {cioObjectIdentifyServer} from "@comend/lib/customerio/customer-io-objects";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await cioObjectIdentifyServer(body);
        return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: String(e?.message || e) },
            { status: 500 }
        );
    }
}
