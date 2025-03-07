"use client";

import { useEffect } from "react";
import { initializeRoadmapState } from "@/lib/initialize-client-state";
import { Roadmap } from "./roadmap";

export default function RoadmapInitWrapper({ roadmap }: {roadmap: any }) {
    useEffect(() => {
        if (roadmap) {
            initializeRoadmapState({
                nodes: roadmap.nodes,
                milestones: roadmap.milestones,
                edges: roadmap.edges,
                selectedNodeId: null,
                roadmapId: roadmap.id
            });
        }
    }, [roadmap]);

    return <Roadmap data={roadmap}/>
}