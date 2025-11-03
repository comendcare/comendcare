import { cioIdentify } from '@/packages/lib/customer-io-identify'
import { NextResponse } from 'next/server'
// import {customerIOIdentify} from "@/packages/lib/customer-io";

export async function POST(req: Request) {
    const { userId, name, email } = await req.json()
    // await customerIOIdentify(userId, { user: { name, email } } as any) // or adjust your helper signature
    cioIdentify(userId, {name, email})
    return NextResponse.json({ ok: true })
}
