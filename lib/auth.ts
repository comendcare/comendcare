import {getServerSession, type NextAuthOptions} from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import EmailProvider from "next-auth/providers/email";
import {PrismaAdapter} from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"

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
        newUser: "/onboarding/organization"
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
            session.user = {
                ...session.user,
                // @ts-expect-error
                id: token.sub,
                // @ts-expect-error
                username: token?.user?.username || token?.user?.gh_username,
                organizationId: token.organizationId as string | null, // Ensure type matches
            };
            return session;
        },
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
