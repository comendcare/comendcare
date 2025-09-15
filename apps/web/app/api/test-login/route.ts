import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@comend/lib/prisma";
import { encode } from "next-auth/jwt";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL;
const cookieName = `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`;

export async function GET(req: Request) {
    // Only available in tests
    if (!process.env.E2E) {
        return new NextResponse("Not found", { status: 404 });
    }

    const url = new URL(req.url);
    const email = url.searchParams.get("email") || "";
    const redirect = url.searchParams.get("redirect") || "/";

    if (!email) return new NextResponse("email required", { status: 400 });

    // Ensure test user exists
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: "E2E User" },
    });

    // Mint a NextAuth JWT (you use session: { strategy: "jwt" })
    const token = await encode({
        token: { sub: user.id, email: user.email, name: user.name },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Match cookie options from packages/lib/auth.ts
    cookies().set({
        name: cookieName,
        value: token,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: VERCEL_DEPLOYMENT,
        // domain: VERCEL_DEPLOYMENT ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` : undefined,
    });

    return NextResponse.redirect(redirect);
}
