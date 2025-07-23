import {ReactNode, Suspense} from "react";
import {ResearcherNavbar} from "~researcher/components/researcher-navbar";

export default async function ResearcherLayout({children}: { children: ReactNode }) {
    return (
        <div>
            <ResearcherNavbar/>
            <div className="min-h-screen">
                {children}
            </div>
        </div>
    );
}
