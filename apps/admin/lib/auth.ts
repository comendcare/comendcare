import {getServerSession, type NextAuthOptions} from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import {PrismaAdapter} from "@next-auth/prisma-adapter"
import prisma from "@comend/lib/prisma"
import {Member, PrismaClient} from "@prisma/client";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL

export const authOptions: NextAuthOptions = {
    providers: [
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
        })
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

        async signIn({user, account, profile, email, credentials}) {
            const isAllowedToSignIn = true
            if (isAllowedToSignIn) {
                return true
            } else {
                return false
            }
        },

        jwt: async ({token, user, trigger, session}) => {
            if (user) {
                token.user = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            }
            return token;
        },

        async session({session, token}) {
            session.user = token.user as {
                id: string;
                name: string;
                email: string;
                image: string;
            };
            return session;
        },
    },

    debug: process.env.VERCEL_URL === "development",
};

export function getSession() {
    return getServerSession(authOptions) as Promise<{
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
        }
    } | null>
}

/*
    This auth wrapper is meant to wrap admin actions ONLY

    Auth wrapper - only allows the given action function to execute if the active user satisfies the following criteria:
    1. User is logged in - i.e. the active user's data is included in the session
    2. The user exists in the database
    3. The user's email is included in our admin whitelist
*/
export function withAdminAuth(action: any) {
    return async (
        ...args: any
    ) => {
        const session = await getSession()
        if (!session) {
            return {error: "Not authenticated: could not find session data"}
        }

        const user = await prisma.user.findUnique({
            where: {id: session.user.id}
        })
        if (!user) {
            return {error: `Not authenticated: could not find user data in the database for user ${session.user.id}`}
        }
        if (!user.email) {
            return {error: `Not authenticated: could not find email address in the database for user ${session.user.id}`}
        }

        const adminUserEmailsList = process.env.ADMIN_WHITELIST?.split(",")
        if (!adminUserEmailsList?.includes(user.email)) return {error: `Not authenticated: email ${user.email} is not included in the admin whitelist.`}

        return action(...args)
    }
}
