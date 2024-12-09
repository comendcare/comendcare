"use client"

import {KanbanView} from "@/components/kanban";
import {useEffect} from "react";
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore";
import {useShallow} from "zustand/react/shallow";
import {useSearchParams} from "next/navigation";

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    selectedTaskId: state.selectedTaskId,
    setSelectedTaskId: state.setSelectedTaskId,
    milestones: state.milestones,
    initState: state.initState
})

export default function KanbanBoard({
                                       roadmapId,
                                       initNodes,
                                       initEdges,
                                       initMilestones,
                                       // initTasks
                                   }: {
    roadmapId: string
    initNodes: any[]
    initEdges: any[]
    initMilestones: any[]
    // initTasks: any[]
}) {

    const searchParams = useSearchParams()
    const {
        initState
    } = useRoadmapStore(useShallow(selector))

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        const urlMilestone: string | null = params.get("milestone")
        const urlTask: string | null = params.get("task")

        initState(initNodes, initEdges, initMilestones, urlMilestone, urlTask, roadmapId)
    }, [])

    return (
        <div>
            <KanbanView/>
        </div>
    )
}