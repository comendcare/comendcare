// lib/custom-prisma-adapter.ts
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import type {Adapter, AdapterAccount} from "next-auth/adapters";
import type {PrismaClient} from "@prisma/client";

const MAX_INT_32 = 2_147_483_647;

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
    const base = PrismaAdapter(prisma);

    return {
        ...base,

        async linkAccount(account: AdapterAccount) {
            const {
                provider,
                type,
                providerAccountId,
                refresh_token,
                refresh_token_expires_in,
                access_token,
                expires_at,
                token_type,
                scope,
                id_token,
                session_state,
                oauth_token_secret,
                oauth_token,
                userId,
                // ⚠️ These are stripped because your model doesn't support them:
                // name,
                // orcid,
            } = account;

            await prisma.account.create({
                data: {
                    provider,
                    type,
                    providerAccountId,
                    refresh_token: refresh_token as string | null | undefined,
                    refresh_token_expires_in: refresh_token_expires_in as number | null | undefined,
                    access_token: access_token as string | null | undefined,
                    expires_at: expires_at && Number(expires_at) > MAX_INT_32
                        ? MAX_INT_32
                        : Number(expires_at) ?? null,
                    token_type: token_type as string | null | undefined,
                    scope: scope as string | null | undefined,
                    id_token: id_token as string | null | undefined,
                    session_state: session_state as string | null | undefined,
                    oauth_token_secret: oauth_token_secret as string | null | undefined,
                    oauth_token: oauth_token as string | null | undefined,
                    userId,
                },
            });
        },
    };
}
