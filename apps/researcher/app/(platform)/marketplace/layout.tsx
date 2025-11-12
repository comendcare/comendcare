import {ReactNode} from "react";
import { MarketplaceNav } from "~researcher/components/marketplace/marketplace-nav";
import {ResearcherNavbar} from "~researcher/components/researcher-navbar";

export default async function ResearcherLayout({children}: { children: ReactNode }) {
    return (
        <div>
            <ResearcherNavbar/>
            <div className="min-h-screen container relative flex flex-col gap-4 items-center mx-auto pt-4">
                <MarketplaceNav />
                {children}
            </div>
        </div>
    );
}
