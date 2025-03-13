"use client";

import { useEffect } from "react";
import { initializeRoadmapState } from "@/lib/initialize-client-state";
import { Roadmap } from "./roadmap";
import { useRouter } from "next/navigation";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import Loading from "@/app/loading";
import { getNodesEdgesAndMilestones, getRoadmapId } from "@/lib/fetchers";

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId
})

export default function RoadmapInitWrapper({ roadmap }: {roadmap: any }) {
    const router = useRouter()
    const { roadmapId } = useRoadmapStore(useShallow(selector))

    useEffect(() => {
        const init = async () => {
            if (!roadmap || roadmap.id !== roadmapId) {
                // if the roadmapId doesn't match what's in the zustand store
                // refresh the page to re-initialize the zustand state
                // this will happen when we've created a brand new research plan
                router.refresh()
            }
        }

        init()
    }, [roadmap])

    return <Roadmap data={roadmap}/>
}