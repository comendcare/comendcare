import React from "react"
import prisma from "@/lib/prisma"
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrganizationMarketplaceCard } from "@/components/marketplace-pag-card";
import MarketplaceSearchBar from "@/components/marketplace-searchbar";

export default async function PatientGroupsPage() {
    const PAGs = await prisma.organization.findMany()

    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 items-center h-full mx-auto">
            <ScrollArea className="px-8">
                <div className="flex flex-col gap-4">
                    <MarketplaceSearchBar/>
                    <div className="w-full grid gap-4 grid-cols-1 lg:grid-cols-2">
                        {PAGs?.map((organization, index) => (
                            <OrganizationMarketplaceCard organization={organization} key={index} />
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </main>
    )
}
