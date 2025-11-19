import {ReactNode} from "react";
import { MarketplaceNav } from "~researcher/components/marketplace/marketplace-nav";
import * as React from "react";

export default async function ResearcherLayout({children}: { children: ReactNode }) {
    return (
        <div>
            <div className="min-h-screen container relative flex flex-col gap-4 items-center mx-auto pt-4">
                <MarketplaceNav />
                {children}
            </div>
        </div>
    );
}
