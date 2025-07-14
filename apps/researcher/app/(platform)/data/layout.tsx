import {ReactNode, Suspense} from "react";
import {ResearcherNavbar} from "~researcher/components/researcher-navbar";

export default async function ResearcherLayout({children}: { children: ReactNode }) {
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
