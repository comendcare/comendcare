import {ReactNode, Suspense} from "react";
import Profile from "~admin/components/profile";
import AdminNav from "~admin/components/admin-nav";
import {redirect} from "next/navigation";
import { getIsAdmin } from "~admin/lib/utils";
import { getSession } from "~admin/lib/auth";

export default async function AdminLayout({children}: { children: ReactNode }) {
    const session = await getSession()
    const isAdmin = getIsAdmin(session)

    // Redirect if the user is not signed in or not an admin, with a query parameter
    if (!session) {
        redirect("/login?error=unauthenticated");
    } else if (!isAdmin) {
        redirect("/login?error=notAdmin");
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
