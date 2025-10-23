"use client"

import {PublicMarketplaceNav} from "~web/components/marketplace/marketplace-nav"
import { TooltipProvider } from "@/packages/components/ui/tooltip"
import { Separator } from "@/packages/components/ui/separator"

// export const metadata: Metadata = {
//     title: "Comend",
//     description: "Check out some examples app built using the components."
// }

interface ProjectLayoutProps {
    children: React.ReactNode
}

export default function ProjectLayout({children}: ProjectLayoutProps) {
    // Zustand state management
    return (
        <TooltipProvider>
            <div className="w-full flex justify-center">
                <div className="max-w-7xl mt-16 lg:mt-28 h-full w-full flex flex-col items-center p-4 gap-4 md:gap-6">
                    <div className="flex w-full flex-col gap-4">
                        <h1 className="text-3xl md:text-4xl font-semibold">Explore Comend</h1>
                    </div>
                    <Separator />
                    <PublicMarketplaceNav />
                    {children}
                </div>
            </div>
        </TooltipProvider>
    )
}
