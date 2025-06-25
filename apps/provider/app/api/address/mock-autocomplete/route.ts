import {mockAddresses} from "@comend/lib/mock";
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ data: mockAddresses, error: null });
}
