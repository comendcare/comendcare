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
    milestones: any[]
}) {
    if (typeof window !== "undefined") {
        console.log(`init roadmap state`)
        const initRoadmapState = useRoadmapStore.getState().initState;
        const { roadmapId, nodes, edges, milestones } = initData;

        // Call Zustand's initState directly
        initRoadmapState(nodes, edges, milestones, null, null, roadmapId || "");
    }
}

export function initializeKanbanState(initData: {
    columns: ColumnType[]
}) {
    if (typeof window !== "undefined") {
        console.log(`init kanban state`)
        const initKanbanState = useKanbanStore.getState().initState;
        const { columns } = initData;

        // Call Zustand's initState directly
        initKanbanState(columns, columns.flatMap(column => column.tasks) || [])
    }
}