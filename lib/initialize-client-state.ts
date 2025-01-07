"use client";

import { useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useKanbanStore } from "@/state/kanban/kanbanStore";
import { Prisma } from "@prisma/client";

type ColumnType = Prisma.ColumnGetPayload<{ 
    include: { 
        tasks: true
    } 
}>

export function initializeClientState(initData: {
    roadmapId: string | null | undefined
    nodes: any[]
    edges: any[]
    milestones: any[]
    columns: ColumnType[]
}) {
    if (typeof window !== "undefined") {
        const initRoadmapState = useRoadmapStore.getState().initState;
        const { roadmapId, nodes, edges, milestones } = initData;

        // Call Zustand's initState directly
        initRoadmapState(nodes, edges, milestones, null, null, roadmapId || "");

        const initKanbanState = useKanbanStore.getState().initState;
        const { columns } = initData;

        // Call Zustand's initState directly
        initKanbanState(columns, columns.flatMap(column => column.tasks) || [])
    }
}