"use client";

import { useRoadmapStore } from "@/state/roadmap/roadmapStore";

export function initializeClientState(initData: {
    roadmapId: string | null | undefined
    nodes: any[]
    edges: any[]
    milestones: any[]
}) {
    if (typeof window !== "undefined") {
        const initState = useRoadmapStore.getState().initState;
        const { roadmapId, nodes, edges, milestones } = initData;

        // Call Zustand's initState directly
        initState(nodes, edges, milestones, null, null, roadmapId || "");
    }
}