import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const form = await req.formData();
    const target = form.get("target");
    if (!target || typeof target !== "string") {
        return new NextResponse("Invalid request", { status: 400 });
    }
    // 303 so browser follows with GET to the NextAuth callback
    return NextResponse.redirect(target, { status: 303 });
}

// Harden: don't allow GET so scanners can't trigger this.
export const GET = () => new NextResponse("Method Not Allowed", { status: 405 });
