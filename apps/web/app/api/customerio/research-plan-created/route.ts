// app/api/customerio/research-plan-created/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import {customerIOOnResearchPlanCreated} from "@/packages/lib/customer-io";

export async function POST(req: Request) {
    const { userId, props } = await req.json();
    await customerIOOnResearchPlanCreated(userId, props);
    return NextResponse.json({ ok: true });
}
