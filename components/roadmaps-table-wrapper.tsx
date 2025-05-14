"use client"

import { useRouter } from "next/navigation"
import { RoadmapsTable } from "./public-roadmap-card"
import { useEffect } from "react"
import { initializeRoadmapState } from "@/lib/initialize-client-state"

export const RoadmapsTableWrapper = ({roadmaps}: {roadmaps: any[]}) => {
    const router = useRouter()

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

    return (
        <RoadmapsTable 
            roadmaps={roadmaps} 
            rowClickCallback={(roadmap) => {
                router.push(`/app/research-plan/${roadmap.id}`)
            }}
        />
    )
}