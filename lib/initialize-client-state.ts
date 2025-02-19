"use client";

import { useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useKanbanStore } from "@/state/kanban/kanbanStore";
import { Prisma } from "@prisma/client";

type ColumnType = Prisma.ColumnGetPayload<{ 
    include: { 
        tasks: true
    } 
}>

export function initializeRoadmapState(initData: {
    roadmapId: string | null | undefined
    nodes: any[]
    edges: any[]
    milestones: any[],
    selectedView?: string | null,
    selectedNodeId: string | null
}) {
    const { clear } = useRoadmapStore.temporal.getState()

    if (typeof window !== "undefined") {
        const initRoadmapState = useRoadmapStore.getState().initState;
        const { roadmapId, nodes, edges, milestones, selectedView, selectedNodeId } = initData;

        // Call Zustand's initState directly
        initRoadmapState(nodes, edges, milestones, selectedView || null, selectedNodeId, null, roadmapId || "");
        clear() // clear first/uninitialized state from history, so undo doesn't apply the un-initialized state
    }
}

export function initializeKanbanState(initData: {
    columns: ColumnType[]
}) {
    if (typeof window !== "undefined") {
        const initKanbanState = useKanbanStore.getState().initState;
        const { columns } = initData;

        // Call Zustand's initState directly
        initKanbanState(columns, columns.flatMap(column => column.tasks) || [])
    }
}