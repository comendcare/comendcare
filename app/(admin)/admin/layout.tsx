import {ReactNode, Suspense} from "react";
import Profile from "@/components/profile";
import AdminNav from "@/components/admin-nav";
import {redirect} from "next/navigation";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export default async function DashboardLayout({children}: { children: ReactNode }) {
    const session = await getServerSession(authOptions);

    // Determine if the user is an admin
    const isAdmin = session?.user?.email?.endsWith("@comendcare.com") ||
        (process.env.ADMIN_WHITELIST?.split(",").includes(session?.user?.email || ""));

    // Redirect if the user is not signed in or not an admin, with a query parameter
    if (!session) {
        redirect("/login/admin?error=unauthenticated");
    } else if (!isAdmin) {
        redirect("/login/admin?error=notAdmin");
    }

    return (
        <div>
            <AdminNav>
                <Suspense fallback={<div>Loading...</div>}>
                    <Profile/>
                </Suspense>
            </AdminNav>
            <div className="min-h-screen dark:bg-black sm:pl-60">{children}</div>
        </div>
    );
}
