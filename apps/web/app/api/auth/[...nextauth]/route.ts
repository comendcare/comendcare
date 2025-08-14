import NextAuth from "next-auth";
import { authOptions } from "@/packages/lib/auth";

// Create the NextAuth handler for normal requests
const handler = NextAuth(authOptions);

// Handle the methods NextAuth cares about
export { handler as GET, handler as POST };

// IMPORTANT: Short-circuit HEAD so scanners don't burn tokens
export async function HEAD() {
    return new Response(null, {
        status: 200,
        headers: {
            "cache-control": "no-store",
        },
    });
}
