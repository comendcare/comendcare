"use client"
import { useEffect, useState } from "react";
import { Roadmap } from "@prisma/client";
import { ResearchPlanTemplatesCard } from "./roadmap-templates";
import { PrivateNoResearchPlansRow } from "./no-research-plans";
import Loading from "@/app/loading";
import { initializeRoadmapState } from "@/lib/initialize-client-state";
import { useRouter } from "next/navigation";
import { RoadmapsTable } from "./public-roadmap-card";

export default function RoadmapsPage({roadmaps, orgId}: {roadmaps: Roadmap[], orgId: string}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // un-initialize any active research plans
        initializeRoadmapState({
            roadmapId: undefined,
            details: undefined,
            nodes: [],
            edges: [],
            milestones: [],
            selectedView: null,
            selectedNodeId: null 
        })
    }, [])

    if (isLoading) return <Loading />

    return (
        <main className="flex flex-col items-center h-full w-full mx-auto p-4 gap-4">
            <ResearchPlanTemplatesCard orgId={orgId} setIsLoading={setIsLoading}/>
            <div className="p-6 w-full">
                <h2 className="col-span-full font-semibold text-2xl">Research Plans</h2>
                {roadmaps.length > 0 && (
                    <RoadmapsTable 
                        roadmaps={roadmaps} 
                        rowClickCallback={(roadmap) => {
                            setIsLoading(true)
                            router.push(`/app/research-plan/${roadmap.id}`)
                        }}
                    />
                )}
                {roadmaps.length === 0 && (
                    <PrivateNoResearchPlansRow />
                )}
            </div>
        </main>
    )
}