import {getServerSession, type NextAuthOptions} from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import LinkedInProvider from "next-auth/providers/linkedin"
import EmailProvider from "next-auth/providers/email";
import {PrismaAdapter} from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import {Member, Organization, PrismaClient} from "@prisma/client";
import {User} from "next-auth";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL

export const authOptions: NextAuthOptions = {
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
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture.data.url,
                }
            },
        }),
        LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID as string,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
            allowDangerousEmailAccountLinking: true,
            async profile(profile, tokens) {
                const emailResponse = await fetch(
                    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
                    {headers: {Authorization: `Bearer ${tokens.access_token}`}}
                )
                const emailData = await emailResponse.json()
                return {
                    id: profile.id,
                    name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
                    email: emailData?.elements?.[0]?.["handle~"]?.emailAddress,
                    image:
                    profile.profilePicture?.["displayImage~"]?.elements?.[0]
                        ?.identifiers?.[0]?.identifier,
                }
            }
        }),
        GitHubProvider({
            clientId: process.env.AUTH_GITHUB_ID as string,
            clientSecret: process.env.AUTH_GITHUB_SECRET as string,
            allowDangerousEmailAccountLinking: true,
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name || profile.login,
                    gh_username: profile.login,
                    email: profile.email,
                    image: profile.avatar_url
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
            name: `${VERCEL_DEPLOYMENT ? "__Secure-" : ""}next-auth.session-token`,
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
        }
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
            if (trigger === 'update') {
                token.organizationId = session.organizationId;
            }
            if (user) {
                // Fetch the user's organizationId from the database
                const dbUser = await prisma.user.findUnique({
                    where: {id: user.id},
                    include: {memberships: true},
                });

                // Extract organization IDs from the user's memberships
                const organizationIds: string[] = dbUser?.memberships
                    .map((membership) => membership.organizationId)
                    .filter((id): id is string => !!id) || []

                const membership = dbUser?.memberships[0]

                token.user = user;
                token.organizationId = organizationIds[0] || null; // Default to the first ID, if any
                token.membership = membership || null;
            }
            return token
        },

        session: async ({session, token}) => {
            // Check if the user still exists in the database
            const dbUser = await prisma.user.findUnique({
                where: {id: token.sub},
                include: { memberships: true }, // Ensure we get latest memberships
            });

            const organizationIds = dbUser?.memberships.map((m) => m.organizationId);

            // Storing both the current organizationId AND the membership object is redundant
            // The membership object has the organizationId
            let activeOrganizationId = token.organizationId as string | null;
            let membership = token.membership as Member | null

            if (organizationIds) {
                // If activeOrganizationId is null but the user has memberships, use the first membership
                if (!activeOrganizationId && organizationIds.length > 0) {
                    activeOrganizationId = organizationIds[0];
                }

                // If activeOrganizationId is set but not in the user's memberships, reset to null
                if (activeOrganizationId && !organizationIds.includes(activeOrganizationId)) {
                    activeOrganizationId = null;
                }
            }

            if (dbUser) {
                if (!membership && dbUser.memberships.length > 0) {
                    // Assign the first membership if none exists
                    membership = dbUser.memberships[0];
                } else if (
                    membership &&
                    !dbUser.memberships.some((m) => m.id === membership?.id)
                ) {
                    // If membership exists but isn't in the user's memberships, reset it
                    membership = null;
                } else if (membership) {
                    const matchingMembership = dbUser.memberships.find((m) => m.id === membership?.id);

                    if (matchingMembership && matchingMembership.role !== membership.role) {
                        // Role has changed — terminate the session such that user must log back in
                        session.roleChanged = true;
                    }
                }
            }

            if (!dbUser) {
                // Continue with your existing session logic
                session.user = {
                    ...session.user,
                    // @ts-expect-error
                    id: token.sub,
                    // @ts-expect-error
                    username: token?.user?.username || token?.user?.gh_username,
                    organizationId: token.organizationId as string | null, // Ensure type matches
                    membership: token.membership as any
                };

                // If user cannot be found, assume they've been deleted and forcibly sign them out in the frontend.
                session.terminate = true
                session.expires = new Date().toDateString()

                return session
            }

            // Continue with your existing session logic
            session.user = {
                ...session.user,
                // @ts-expect-error
                id: token.sub,
                // @ts-expect-error
                username: token?.user?.username || token?.user?.gh_username,
                organizationId: activeOrganizationId,
                membership: membership
            };

            return session;
        }
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
    return async(
        ...args: any
    ) => {
        const session = await getSession()
        if (!session) {
            return {error: "Not authenticated: could not find session data"}
        }

        const user = await prisma.user.findUnique({
            where: {id: session.user.id}
        })
        if (!user) return {error: `Not authenticated: could not find user data in the database for user ${session.user.id}`}
        if (!user.email) return {error: `Not authenticated: could not find email address in the database for user ${session.user.id}`}

        const adminUserEmailsList = process.env.ADMIN_WHITELIST?.split(",")
        if (!adminUserEmailsList?.includes(user.email)) return {error: `Not authenticated: email ${user.email} is not included in the admin whitelist.`}

        return action(...args)
    }
}

/*
    This is the most basic auth wrapper - for actions that are available to ALL users on the platform, no matter which organization
    they're a part of. It just ensures the user is logged in & has an account on the platform

    Auth wrapper - only allows the given action function to execute if the active user satisfies the following criteria:
    1. The user is signed in
    2. The user exists in the database
 */
export function withAuth(action: any) {
    return async (
        ...args: any
    ) => {
        const session = await getSession()
        if (!session || !session?.user?.id) {
            return {error: "Not authenticated: could not find session data"}
        }

        const user = await prisma.user.findUnique({
            where: {id: session.user.id}
        })
        if (!user) return {error: `Not authenticated: could not find user data in the database for user ${session.user.id}`}

        return action(...args)
    }
}

/*
    Auth wrapper - only allows the given action function to execute if the active user satisfies the following criteria:
    1. User is logged in - i.e. the active user's data is included in the session
    2. The user is a member of the given organization
    3. The user's membership role matches one of the provided roles. If no roles are provided, it is assumed that the action
        is accessible to EVERY org member
*/
export function withOrganizationAuth(action: any, roles?: string[]) {
    return async (
        // formData: FormData | null,
        organizationId: string | null | undefined,
        ...args: any
        // roles?: string[]
    ) => {
        const session = await getSession()
        if (!session) {
            return {error: "Not authenticated: could not find session data"}
        }

        if (!organizationId) return {error: "Not authorized: organizationId not provided"}

        const organization = await prisma.organization.findUnique({
            where: {id: organizationId},
            include: {members: true}
        })
        const membership = organization?.members.find(member => member.userId === session.user.id)

        if (!organization) return {error: "Not authorized: organization doesn't exist"}
        if (!membership) return {error: "Not authorized: user is not a member of this organziation"}

        if (roles) {
            if (!roles.includes(membership.role)) {
                return { error: `Not authorized: role ${membership.role} doesn't have access to this action`}
            }
        }

        return action(organization, ...args)
    }
}

export function withOrganizationAttributeAuth(action: any) {
    return async (
        formData: FormData | null,
        organizationId: string,
        key: string | null
    ) => {
        const session = await getSession()
        if (!session) {
            return {
                error: "Not authenticated"
            }
        }
        const organization = await prisma.organization.findUnique({
            where: {
                id: organizationId
            }
        })
        if (!organization || organization.userId !== session.user.id) {
            return {
                error: "Not authorized"
            }
        }

        return action(formData, organization, key)
    }
}
