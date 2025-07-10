import {ReactNode, Suspense} from "react";
import {redirect} from "next/navigation";
import {getSession} from "~researcher/lib/auth";
import {ResearcherNavbar} from "~researcher/components/researcher-navbar";

export default async function ProviderLayout({children}: { children: ReactNode }) {
    const session = await getSession()

    // Redirect if the user is not signed in or not an admin, with a query parameter
    if (!session) {
        redirect("/login?error=unauthenticated");
    }

    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <ResearcherNavbar/>
            </Suspense>
            <div className="min-h-screen">
                {children}
            </div>
        </div>
    );
}
