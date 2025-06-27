import {ReactNode, Suspense} from "react";
import Profile from "@/apps/admin/components/profile";
// import AdminNav from "@/apps/admin/components/admin-nav";
import {redirect} from "next/navigation";
import {getSession} from "@comend/lib/auth";

export default async function ProviderLayout({children}: { children: ReactNode }) {
    const session = await getSession()

    // Redirect if the user is not signed in or not an admin, with a query parameter
    if (!session) {
        redirect("/login?error=unauthenticated");
    }

    return (
        <div>
            {/* <AdminNav> */}
                <Suspense fallback={<div>Loading...</div>}>
                    <Profile/>
                </Suspense>
            {/* </AdminNav> */}
            <div className="min-h-screen dark:bg-black sm:pl-60">{children}</div>
        </div>
    );
}
