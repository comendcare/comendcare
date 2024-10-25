import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            id: string
            bio?: string | null | undefined
            organizationId?: string | null | undefined
        } & DefaultSession["user"]
    }
    interface User {
        id: string
        bio?: string | null | undefined
        organizationId?: string | null | undefined
    }
}
