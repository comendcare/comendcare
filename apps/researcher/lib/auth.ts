import {getServerSession, type NextAuthOptions} from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email";
import prisma from "@comend/lib/prisma"
import {PrismaClient} from "@prisma/client";
import {OAuthConfig} from "next-auth/providers/oauth";
import {CustomPrismaAdapter} from "./custom-prisma-adapter";
import sgMail from "@sendgrid/mail";
import {cioIdentify} from "../../../packages/lib/customerio/customer-io-identify";
import { mixpanelTrack } from "@comend/lib/mixpanel";

const VERCEL_DEPLOYMENT = !!process.env.VERCEL_URL
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'production';

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
            scope: 'openid profile email',
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
        const email = profile.email ?? undefined;

        return {
            id: profile.sub,
            name: `${given} ${family}`.trim(),
            email,          // 👈 no synthetic fallback here
            image: undefined,
        }
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
                        <p>Click the button to complete signing in to the Researcher Hub:</p>
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

    // events: {
    //     async signIn({ user, account }) {
    //         if (!user?.id) return;
    //
    //         const existingResearcher = await prisma.researcher.findUnique({
    //             where: { id: user.id },
    //         });
    //
    //         if (!existingResearcher) {
    //             await prisma.researcher.create({
    //                 data: {
    //                     userId: user.id,
    //                     email: user.email ?? undefined,
    //                     name: user.name ?? "",
    //                     ...(account?.provider === "orcid" && {
    //                         orcid: account.providerAccountId,
    //                     }),
    //                 },
    //             });
    //         }
    //     },
    // },

    events: {
        async signIn({ user, account }) {
            if (!user?.id) return; // NextAuth expects a boolean

            const orcid =
                account?.provider === "orcid" ? account.providerAccountId : undefined;

            // Researcher is uniquely keyed by userId, not by id
            const existingResearcher = await prisma.researcher.findUnique({
                where: { userId: user.id },
            });

            if (!existingResearcher) {
                const newResearcher = await prisma.researcher.create({
                    data: {
                        userId: user.id,
                        ...(orcid && { orcid }),
                    },
                });
                try {
                    mixpanelTrack("Researcher Created", {
                        "ID": newResearcher.id,
                        "User ID": newResearcher.userId,
                        "orcid": newResearcher.orcid
                    })
                } catch (e) {
                    console.error("Error tracking mixpanel event:", e)
                }
            } else if (orcid && !existingResearcher.orcid) {
                // Optionally update ORCID on later ORCID logins
                await prisma.researcher.update({
                    where: { id: existingResearcher.id },
                    data: { orcid },
                });
            }

            return;
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

            try {
                if (isProd) {
                    await cioIdentify(dbUser.id!, {
                        user_type: "researcher",
                        email: dbUser.email ?? undefined,
                        name: dbUser.name ?? undefined,
                        created_at: dbUser.createdAt,
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

export function withResearcherAuth(action: any) {
    return async (
        researcherId: string | null | undefined,
        ...args: any
    ) => {
        const session = await getSession()
        if (!session) {
            // toast.error("Not authenticated: could not find session data")
            return {error: "Not authenticated: could not find session data"}
        }

        if (!researcherId) return {error: "Not authorized: userId not provided"}

        const researcher = await prisma.researcher.findUnique({
            where: {id: researcherId}
        })
        if (!researcher) {
            return {error: "Not authorized: researcher doesn't exist"}
        }

        return action(researcher, ...args)
    }
}
