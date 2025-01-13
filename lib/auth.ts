import {getServerSession, type NextAuthOptions} from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import LinkedInProvider from "next-auth/providers/linkedin"
import EmailProvider from "next-auth/providers/email";
import {PrismaAdapter} from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
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
    adapter: PrismaAdapter(prisma),
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

                token.user = user;
                token.organizationId = organizationIds[0] || null; // Default to the first ID, if any
            }
            return token
        },

        session: async ({session, token}) => {
            // Check if the user still exists in the database
            const dbUser = await prisma.user.findUnique({
                where: {id: token.sub},
            });

            // If the user does not exist, return null to terminate the session
            if (!dbUser) {
                // Continue with your existing session logic
                session.user = {
                    ...session.user,
                    // @ts-expect-error
                    id: token.sub,
                    // @ts-expect-error
                    username: token?.user?.username || token?.user?.gh_username,
                    organizationId: token.organizationId as string | null, // Ensure type matches
                };

                return session
            }

            // Continue with your existing session logic
            session.user = {
                ...session.user,
                // @ts-expect-error
                id: token.sub,
                // @ts-expect-error
                username: token?.user?.username || token?.user?.gh_username,
                organizationId: token.organizationId as string | null, // Ensure type matches
            };

            return session;
        }
    },

    debug: process.env.VERCEL_URL === "development",
};

export function getSession() {
    return getServerSession(authOptions) as Promise<{
        user: {
            id: string
            name: string
            username: string
            email: string
            image: string
            organizationId: string
        }
    } | null>
}

export function withOrganizationAuth(action: any) {
    return async (
        formData: FormData | null,
        organizationId: string,
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

        return action(formData, organization)
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

export function withRoadmapAuth(action: any) {
    return async (
        formData: FormData | null,
        roadmapId: string,
        key: string | null
    ) => {
        const session = await getSession()
        if (!session?.user.id) {
            return {
                error: "Not authenticated"
            }
        }
        const roadmap = await prisma.roadmap.findUnique({
            where: {
                id: roadmapId
            },
            include: {
                organization: true
            }
        })
        if (!roadmap || roadmap.userId !== session.user.id) {
            return {
                error: "Roadmap not found"
            }
        }

        return action(formData, roadmap, key)
    }
}
