import {Suspense} from "react";
import Organizations from "~admin/components/organizations";
import OverviewStats from "~admin/components/overview-stats";
import Roadmaps from "~admin/components/roadmaps";
import PlaceholderCard from "@comend/components/placeholder-card";
import OverviewOrganizationsCTA from "~admin/components/overview-organizations-cta";
import prisma from "@comend/lib/prisma"

export default async function Overview() {
    const organizations = await prisma.organization.findMany({
        orderBy: {
            createdAt: "desc"
        },
        take: 4 // only fetch 4 for overview
    })
    
    return (
        <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
            <div className="flex flex-col space-y-6">
                <h1 className="font-cal text-3xl font-bold dark:text-white">
                    Overview
                </h1>
                <OverviewStats/>
            </div>

            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-cal text-3xl font-bold dark:text-white">
                        Recently Created Organizations
                    </h1>
                    <Suspense fallback={null}>
                        <OverviewOrganizationsCTA/>
                    </Suspense>
                </div>
                <Suspense
                    fallback={
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({length: 4}).map((_, i) => (
                                <PlaceholderCard key={i}/>
                            ))}
                        </div>
                    }
                >
                    <Organizations searchable={false} organizations={organizations}/>
                </Suspense>
            </div>

            <div className="flex flex-col space-y-6">
                <h1 className="font-cal text-3xl font-bold dark:text-white">
                    Recently Updated Roadmaps
                </h1>
                <Suspense
                    fallback={
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({length: 8}).map((_, i) => (
                                <PlaceholderCard key={i}/>
                            ))}
                        </div>
                    }
                >
                    <Roadmaps limit={4}/>
                </Suspense>
            </div>
        </div>
    );
}
