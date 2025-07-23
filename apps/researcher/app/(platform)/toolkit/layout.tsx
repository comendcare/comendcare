import {ReactNode} from "react";
import {ResearcherNavbar} from "~researcher/components/researcher-navbar";

export default async function ResearcherLayout({children}: { children: ReactNode }) {
    return (
        <div>
            <ResearcherNavbar/>
            <div className="min-h-screen container relative flex flex-col items-center mx-auto">
                {children}
            </div>
        </div>
    );
}
