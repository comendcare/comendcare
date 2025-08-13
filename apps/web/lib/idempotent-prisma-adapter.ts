// [...nextauth].ts
import NextAuth from "next-auth";
import type {Adapter, AdapterAccount} from "next-auth/adapters";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type {PrismaClient} from "@prisma/client";

export function IdempotentAdapter(prisma: PrismaClient): Adapter {
    const base = PrismaAdapter(prisma);
    return {
        ...base,
        async useVerificationToken({ identifier, token }) {
            const existing = await prisma.verificationToken.findUnique({
                where: { identifier_token: { identifier, token } },
            });
            if (!existing) return null;
            await prisma.verificationToken.deleteMany({ where: { identifier, token } });
            return existing;
        },
    };
}

