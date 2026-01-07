import {getServerSession, type NextAuthOptions} from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import LinkedInProvider from "next-auth/providers/linkedin"
import EmailProvider from "next-auth/providers/email";
import {PrismaAdapter} from "@next-auth/prisma-adapter"
import prisma from "./prisma"
import {PrismaClient} from "@prisma/client";
import sgMail from "@sendgrid/mail";
import {cioIdentify} from "./customerio/customer-io-identify";

const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'production';


const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

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
            from: process.env.EMAIL_FROM,
            async sendVerificationRequest({identifier, url, provider}) {
                // Derive the correct origin from the callback NextAuth already generated.
                // This works in prod (custom domain), Vercel preview, and local dev.
                const origin = new URL(url).origin;

                const preflightUrl = `${origin}/email-preflight?target=${encodeURIComponent(url)}`;

                const subject = "Sign in to Comend";
                const text = `Complete signing in: ${preflightUrl}`;
                const html = `
                    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; line-height:1.5; color:#111;">
                        <p>Click the button to complete signing in:</p>
                        <p>
                            <a
                                href="${preflightUrl}"
                                style="display:inline-block;padding:10px 16px;border-radius:8px;border:1px solid #d0d7de;text-decoration:none;"
                            >
                                Complete sign in
                            </a>
                        </p>

                        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />

                        <p>Or copy & paste this link:</p>
                        <!-- Show as selectable plain text AND as a link. The outer container prevents ugly wrapping. -->
                        <p style="margin:8px 0;">
                            <a href="${preflightUrl}" style="text-decoration:none;color:inherit;">
                                <span style="display:inline-block; max-width:100%; word-break:break-all; overflow-wrap:anywhere; font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; background:#f6f8fa; padding:8px 10px; border-radius:6px; border:1px solid #e5e7eb;">
                                    ${preflightUrl}
                                </span>
                            </a>
                        </p>
                        
                        
                        <!-- SECURITY WARNING -->
                        <div style="margin:16px 0; padding:12px 14px; border:1px solid #f59e0b; background:#fffbeb; border-radius:8px;">
                            <strong style="display:block; margin-bottom:4px;">Security warning</strong>
                            <div style="font-size:14px; color:#553c04;">
                                • This link is for you only — do <em>not</em> share or forward this email.<br/>
                                • Anyone with this link can access your account.<br/>
                                • If you didn’t request this, please delete this email.
                            </div>
                        </div>

                        <p style="color:#6b7280; font-size:12px; margin-top:12px;">
                            If you didn’t request this, you can safely ignore this email.
                        </p>
                    </div>`;

                await sgMail.send({
                    to: identifier,
                    from: {email: provider.from!, name: "Comend"},
                    trackingSettings: {
                        clickTracking: {enable: false, enableText: false},
                        openTracking: {enable: false},
                        subscriptionTracking: {enable: false},
                    },
                    subject,
                    text,
                    html,
                    categories: ["auth-email"],
                    headers: {"X-Entity-Ref-ID": crypto.randomUUID()},
                });
            },
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
        // GitHubProvider({
        //     clientId: process.env.AUTH_GITHUB_ID as string,
        //     clientSecret: process.env.AUTH_GITHUB_SECRET as string,
        //     allowDangerousEmailAccountLinking: true,
        //     profile(profile) {
        //         return {
        //             id: profile.id.toString(),
        //             name: profile.name || profile.login,
        //             gh_username: profile.login,
        //             email: profile.email,
        //             image: profile.avatar_url
        //         }
        //     }
        // })
    ],
    pages: {
        signIn: `/login`,
        verifyRequest: `/login/verify-request`,
        error: "/login/error", // Error code passed in query string as ?error=
        newUser: "/onboarding"
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
        // async signIn({user, account, profile, email, credentials}) {
        //     const isAllowedToSignIn = true
        //     if (isAllowedToSignIn) {
        //         return true
        //     } else {
        //         return false
        //     }
        // },

        // async signIn({user, account, email}) {
        //     // Always allow the initial verification email to be sent
        //     if (account?.provider === "email" && email?.verificationRequest) {
        //         return true;
        //     }
        //
        //     if (!user?.email || !account?.provider) return true;
        //
        //     const existing = await prisma.user.findUnique({
        //         where: {email: user.email},
        //         include: {accounts: true},
        //     });
        //
        //     if (!existing) return true;
        //
        //     const hasOauth = existing.accounts.length > 0;
        //     const oauthProviders = new Set(existing.accounts.map(a => a.provider));
        //     const trying = account.provider;
        //
        //     if (hasOauth && trying === "email") {
        //         const first = oauthProviders.values().next().value as string | undefined;
        //         return `/login/error?reason=use_original&provider=${first}`;
        //     }
        //     if (!hasOauth && trying !== "email") {
        //         return `/login/error?reason=use_original&provider=email`;
        //     }
        //     return true;
        // },

        async jwt({token, user}) {
            if (user) token.user = user; // minimal
            return token;
        },


        async session({session, token}) {
            const dbUser = await prisma.user.findUnique({
                where: {id: token.sub!},
                include: {memberships: true},
            });

            if (!dbUser) {
                session.terminate = true;
                session.expires = new Date().toISOString();
                // @ts-expect-error
                session.user = {id: token.sub, organizationId: null, membership: null};
                return session;
            }

            const activeOrgId =
                dbUser.activeOrganizationId ??
                dbUser.memberships[0]?.organizationId ??
                null;

            const membership = activeOrgId
                ? dbUser.memberships.find(m => m.organizationId === activeOrgId) ?? null
                : null;

            session.user = {
                ...session.user,
                id: dbUser.id,
                organizationId: activeOrgId,
                membership,
            };

            let dbOrganization: { name: string; subdomain: string } | null = null;
            if (activeOrgId) {
                try {
                    dbOrganization = await prisma.organization.findUnique({
                        where: { id: activeOrgId },
                        select: { name: true, subdomain: true },
                    }) as any;
                } catch (e) {
                    dbOrganization = null;
                }
            }

            try {
                if (isProd) {
                    await cioIdentify(dbUser.id!, {
                        user_type: "pag",
                        email: dbUser.email ?? undefined,
                        name: dbUser.name ?? undefined,
                        created_at: dbUser.createdAt,
                        organization_id: activeOrgId ?? undefined,
                        organization_name: dbOrganization?.name ?? undefined,
                        organization_subdomain: dbOrganization?.subdomain ?? undefined,
                        role: membership?.role ?? undefined,
                    });
                }
            } catch (err) {
                console.warn("Failed to identify user in Customer.io:", err);
            }

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
            // toast.error("Not authenticated: could not find session data")
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
            // toast.error("Not authenticated: could not find session data")
            return {error: "Not authenticated: could not find session data"}
        }

        if (!organizationId) return {error: "Not authorized: organizationId not provided"}

        const organization = await prisma.organization.findUnique({
            where: {id: organizationId},
            include: {members: true}
        })
        const membership = organization?.members.find(member => member.userId === session.user.id)

        if (!organization) {
            // toast.error("Not authorized: organization doesn't exist")
            return {error: "Not authorized: organization doesn't exist"}
        }
        if (!membership) {
            // toast.error("Not authorized: user is not a member of this organziation")
            return {error: "Not authorized: user is not a member of this organziation"}
        }

        if (roles) {
            if (!roles.includes(membership.role)) {
                // toast.error(`Not authorized: role ${membership.role} doesn't have access to this action`)
                return {error: `Not authorized: role ${membership.role} doesn't have access to this action`}
            }
        }

        return action(organization, ...args)
    }
}

export function withUserAuth(action: any) {
    return async (
        userId: string | null | undefined,
        ...args: any
    ) => {
        const session = await getSession()
        if (!session) {
            // toast.error("Not authenticated: could not find session data")
            return {error: "Not authenticated: could not find session data"}
        }

        if (!userId) return {error: "Not authorized: userId not provided"}
        if (userId !== session.user.id) return {error: "Not authorized: provided userId does not match userId in session"}

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })
        if (!user) {
            // toast.error("Not authorized: user doesn't exist")
            return {error: "Not authorized: user doesn't exist"}
        }

        return action(user, ...args)
    }
}

