"use client"

import {KanbanView} from "@/components/kanban";
import {useEffect} from "react";
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore";
import {useShallow} from "zustand/react/shallow";
import {useSearchParams} from "next/navigation";
import {KanbanState, useKanbanStore} from "@/state/kanban/kanbanStore";

const roadmapSelector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    selectedTaskId: state.selectedTaskId,
    setSelectedTaskId: state.setSelectedTaskId,
    milestones: state.milestones,
    initState: state.initState
})

const kanbanSelector = (state: KanbanState) => ({
    initState: state.initState
})

export default function KanbanBoard({
                                        initColumns,
                                        roadmapId,
                                        initTasks
                                    }: {
    roadmapId: string
    initColumns: any[]
    initTasks: any[]
}) {

    const searchParams = useSearchParams()
    // const {
    //     initState: initRoadmapState
    // } = useRoadmapStore(useShallow(roadmapSelector))
    const {
        initState: initKanbanState
    } = useKanbanStore(useShallow(kanbanSelector))

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        const urlMilestone: string | null = params.get("milestone")
        const urlTask: string | null = params.get("task")

        // initRoadmapState(initNodes, initEdges, initMilestones, urlMilestone, urlTask, roadmapId)
        console.log(`init tasks`, initTasks)
        initKanbanState(initColumns, initTasks)
    }, [])

    return (
        <div>
            <KanbanView/>
        </div>
    )
}