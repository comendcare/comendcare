import {getServerSession, type NextAuthOptions} from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email";
import {PrismaAdapter} from "@next-auth/prisma-adapter"
import prisma from "@comend/lib/prisma"
import {PrismaClient} from "@prisma/client";
import {OAuthConfig} from "next-auth/providers/oauth";
import {CustomPrismaAdapter} from "~provider/lib/custom-prisma-adapter";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL

const OrcidProvider = (): OAuthConfig<any> => (    {
    id: 'orcid',
    name: 'ORCID',
    type: 'oauth',
    version: '2.0',
    wellKnown: 'https://orcid.org/.well-known/openid-configuration',
    clientId: process.env.ORCID_CLIENT_ID,
    clientSecret: process.env.ORCID_CLIENT_SECRET,
    authorization: {
        url: 'https://orcid.org/oauth/authorize',
        params: {
            scope: 'openid profile',
            response_type: 'code',
        },
    },
    token: 'https://orcid.org/oauth/token',
    userinfo: 'https://orcid.org/oauth/userinfo',
    checks: ['pkce', 'state'],
    allowDangerousEmailAccountLinking: true,
    profile(profile) {
        const given = profile.given_name ?? '';
        const family = profile.family_name ?? '';
        const fallbackEmail = `orcid-${profile.sub}@orcid.org`; // fallback to synthetic email

        return {
            id: profile.sub,
            name: `${given} ${family}`.trim(),
            email: profile.email ?? fallbackEmail, // ORCID doesn’t return real email
            image: undefined, // ORCID usually doesn’t return profile image
        };
    },
});

export const researcherAuthOptions: NextAuthOptions = {
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                }
            },
            from: process.env.EMAIL_FROM
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            allowDangerousEmailAccountLinking: true,
            profile(profile, tokens) {
                // You can use the tokens, in case you want to fetch more profile information
                // For example several OAuth providers do not return email by default.
                // Depending on your provider, will have tokens like `access_token`, `id_token` and or `refresh_token`
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                }
            }
        }),
        OrcidProvider(),
    ],
    pages: {
        signIn: `/login`,
        verifyRequest: `/login/verify-request`,
        error: "/error", // Error code passed in query string as ?error=
        newUser: "/onboarding"
    },
    // adapter: PrismaAdapter(prisma as PrismaClient),
    adapter: CustomPrismaAdapter(prisma as PrismaClient),
    session: {strategy: "jwt"},
    cookies: {
        sessionToken: {
            name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token-${process.env.NEXT_PUBLIC_APP_ID}`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
                domain: VERCEL_DEPLOYMENT
                    ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                    : undefined,
                secure: VERCEL_DEPLOYMENT
            }
        },
        callbackUrl: {
            name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.callback-url-${process.env.NEXT_PUBLIC_APP_ID}`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
                domain: VERCEL_DEPLOYMENT
                    ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                    : undefined,
                secure: VERCEL_DEPLOYMENT
            },
        },
        csrfToken: {
            name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.csrf-token-${process.env.NEXT_PUBLIC_APP_ID}`,
            options: {
                httpOnly: false,
                sameSite: 'lax',
                path: '/',
                // When working on localhost, the cookie domain must be omitted entirely (https://stackoverflow.com/a/1188145)
                domain: VERCEL_DEPLOYMENT
                    ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                    : undefined,
                secure: VERCEL_DEPLOYMENT
            },
        },
    },

    events: {
        async signIn({ user, account }) {
            if (!user?.id) return;

            const existingResearcher = await prisma.researcher.findUnique({
                where: { id: user.id },
            });

            if (!existingResearcher) {
                await prisma.researcher.create({
                    data: {
                        id: user.id,
                        email: user.email ?? undefined,
                        name: user.name ?? "",
                        ...(account?.provider === "orcid" && {
                            orcid: account.providerAccountId,
                        }),
                    },
                });
            }
        },
    },

    callbacks: {
        jwt: async ({token, user, account}) => {
            if (user) {
                token.user = user;
            }
            if (account?.provider === "orcid") {
                token.accessToken = account.access_token;
                token.orcid = account.providerAccountId; // ORCID iD
            }
            return token;
        },
        session: async ({session, token}) => {
            session.user = {
                ...session.user,
                // @ts-expect-error
                id: token.sub,
            };
            // Optional: Add ORCID iD to session if available
            if (token.orcid) {
                session.user.orcid = token.orcid;
                session.accessToken = token.accessToken;
            }
            return session;
        },
    },

    debug: process.env.VERCEL_URL === "development",
};

export function getSession() {
    return getServerSession(researcherAuthOptions) as Promise<{
        roleChanged: boolean;
        terminate: boolean;
        user: {
            id: string
            name: string
            username: string
            email: string
            image: string
            organizationId: string
            membership: any
            orcid?: string
        }
    } | null>
}
