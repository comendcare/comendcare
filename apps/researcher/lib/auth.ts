import {getServerSession, type NextAuthOptions} from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email";
import {PrismaAdapter} from "@next-auth/prisma-adapter"
import prisma from "@comend/lib/prisma"
import {PrismaClient} from "@prisma/client";
import {OAuthConfig} from "next-auth/providers/oauth";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL

const OrcidProvider = (): OAuthConfig<any> => ({
    id: "orcid",
    name: "ORCID",
    type: "oauth",
    clientId: process.env.ORCID_CLIENT_ID!,
    clientSecret: process.env.ORCID_CLIENT_SECRET!,
    authorization: {
        url: "https://orcid.org/oauth/authorize",
        params: {
            scope: "/authenticate",
            response_type: "code",
            redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/orcid",
        },
    },
    token: "https://orcid.org/oauth/token",
    userinfo: {
        url: "https://pub.orcid.org/v3.0/[ORCID]",
        async request({ tokens }) {
            const res = await fetch(`https://pub.orcid.org/v3.0/${tokens.orcid}`, {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                    Accept: "application/json",
                },
            });
            return await res.json();
        },
    },
    profile(profile) {
        return {
            id: profile["orcid-identifier"]?.path,
            name:
                profile?.person?.name?.["given-names"]?.value +
                " " +
                profile?.person?.name?.["family-name"]?.value,
            email: profile?.person?.emails?.email?.[0]?.email,
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
        newUser: "/onboarding/welcome"
    },
    adapter: PrismaAdapter(prisma as PrismaClient),
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

    callbacks: {
        jwt: async ({ token, user, account }) => {
            if (user) {
                token.user = user;
            }
            if (account?.provider === "orcid") {
                token.accessToken = account.access_token;
                token.orcid = account.providerAccountId; // ORCID iD
            }
            return token;
        },
        session: async ({ session, token }) => {
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
