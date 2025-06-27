import { Session } from "next-auth";

export function getIsAdmin(session: {
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
} | Session | null) {
    
    // Determine if the user is an admin
    // const isAdmin = session?.user?.email?.endsWith("@comendcare.com") ||
    //     (process.env.ADMIN_WHITELIST?.split(",").includes(session?.user?.email || ""));
    const isAdmin = (process.env.ADMIN_WHITELIST?.split(",").includes(session?.user?.email || ""))

    return isAdmin
}