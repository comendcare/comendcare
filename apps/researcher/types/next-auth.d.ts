import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            bio?: string | null;
            organizationId?: string | null;
            membership?: any;
            orcid?: string;
        };
        accessToken?: string;
        terminate?: boolean;
    }

    interface User extends DefaultUser {
        id: string;
        bio?: string | null;
        organizationId?: string | null;
        membership?: any;
        orcid?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        orcid?: string;
        user?: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            bio?: string | null;
            organizationId?: string | null;
            membership?: any;
            orcid?: string;
        };
    }
}
