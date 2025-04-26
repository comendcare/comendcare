import {Suspense} from "react";
import Organizations from "@/components/organizations";
import OverviewStats from "@/components/overview-stats";
import Roadmaps from "@/components/roadmaps";
import Link from "next/link";
import PlaceholderCard from "@/components/placeholder-card";
import OverviewOrganizationsCTA from "@/components/overview-organizations-cta";

export default function Overview() {
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
                    <Organizations limit={4}/>
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
