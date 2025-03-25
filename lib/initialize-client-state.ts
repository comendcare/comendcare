"use client";

import { useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { PlatformNotification, Prisma } from "@prisma/client";
import { useNotificationsStore } from "@/state/notifications/notificationsStore";
import { useCROSearchStore } from "@/state/search/croSearchStore";
import { useMilestoneSearchStore } from "@/state/search/milestoneSearchStore";
import { useOrganizationSearchStore } from "@/state/search/organizationSearchStore";
// import { useKanbanStore } from "@/state/kanban/kanbanStore";

// type ColumnType = Prisma.ColumnGetPayload<{ 
//     include: { 
//         tasks: true
//     } 
// }>

export function initializeCROSearch() {
    if (typeof window !== "undefined") {
        const initCROSearchState = useCROSearchStore.getState().initState;

        // Call Zustand's initState directly
        initCROSearchState()
    }
}

export function initializeMilestoneSearch() {
    if (typeof window !== "undefined") {
        const initMilestoneSearchState = useMilestoneSearchStore.getState().initState;

        // Call Zustand's initState directly
        initMilestoneSearchState()
    }
}

export function initializeOrganizationSearch() {
    if (typeof window !== "undefined") {
        const initOrganizationSearchState = useOrganizationSearchStore.getState().initState;

        // Call Zustand's initState directly
        initOrganizationSearchState()
    }
}

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
        initRoadmapState(nodes, edges, milestones, selectedView || null, selectedNodeId, null, roadmapId || "")
        clear() // clear first/uninitialized state from history, so undo doesn't apply the un-initialized state
    }
}

export function initializeNotificationsState(initData: {
    notifications: PlatformNotification[]
}) {
    if (typeof window !== "undefined") {
        const initNotificationsState = useNotificationsStore.getState().initState
        const { notifications } = initData

        // Call Zustand's initState directly
        initNotificationsState(notifications)
    }
}

// export function initializeKanbanState(initData: {
//     kanbanId: string | undefined,
//     columns: ColumnType[]
// }) {
//     const { clear } = useKanbanStore.temporal.getState()

//     if (typeof window !== "undefined") {
//         const initKanbanState = useKanbanStore.getState().initState;
//         const { columns, kanbanId } = initData;

//         // Call Zustand's initState directly
//         initKanbanState(columns, columns.flatMap(column => column.tasks) || [], kanbanId)
//         clear() // clear first/uninitialized state from history, so undo doesn't apply the un-initialized state
//     }
// }