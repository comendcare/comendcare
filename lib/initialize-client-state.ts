"use client";

import { useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { PlatformNotification, Prisma } from "@prisma/client";
import { useNotificationsStore } from "@/state/notifications/notificationsStore";
import { useCROSearchStore } from "@/state/search/croSearchStore";
import { useMilestoneSearchStore } from "@/state/search/milestoneSearchStore";
import { useOrganizationSearchStore } from "@/state/search/organizationSearchStore";
import { FiltersType as CROMarketplaceFiltersType } from "@/state/search/croSearchStore";
import { FiltersType as PAGMarketplaceFiltersType} from "@/state/search/organizationSearchStore";
import { Asset, RFP, Roadmap } from '@/lib/types';
import { useAssetStore } from "@/state/asset/assetStore";
import { useRFPStore } from "@/state/rfp/rfpStore";

export function initializeCROSearch(filters: CROMarketplaceFiltersType) {
    if (typeof window !== "undefined") {
        const initCROSearchState = useCROSearchStore.getState().initState;

        // Call Zustand's initState directly
        initCROSearchState(filters)
    }
}

export function initializeMilestoneSearch() {
    if (typeof window !== "undefined") {
        const initMilestoneSearchState = useMilestoneSearchStore.getState().initState;

        // Call Zustand's initState directly
        initMilestoneSearchState()
    }
}

export function initializeOrganizationSearch(filters: PAGMarketplaceFiltersType) {
    if (typeof window !== "undefined") {
        const initOrganizationSearchState = useOrganizationSearchStore.getState().initState;

        // Call Zustand's initState directly
        initOrganizationSearchState(filters)
    }
}

export function initializeRoadmapState(initData: {
    roadmapId: string | null | undefined
    details: Roadmap | undefined
    nodes: any[]
    edges: any[]
    milestones: any[]
    selectedView?: string | null
    selectedNodeId: string | null
}) {
    const { clear } = useRoadmapStore.temporal.getState()

    if (typeof window !== "undefined") {
        const initRoadmapState = useRoadmapStore.getState().initState;
        const { roadmapId, details, nodes, edges, milestones, selectedView, selectedNodeId } = initData;

        console.log(`init state nodes`, nodes)

        // Call Zustand's initState directly
        initRoadmapState(details, nodes, edges, milestones, selectedView || null, selectedNodeId, null, roadmapId || "")
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

export function initializeAssetsStore(assets: Asset[]) {
    if (typeof window !== "undefined") {
        const initAssetState = useAssetStore.getState().initState;

        // Call Zustand's initState directly
        initAssetState(assets)
    }
}

export function initializeRFPStore(rfps: RFP[]) {
    if (typeof window !== "undefined") {
        const initRFPState = useRFPStore.getState().initState;

            // Call Zustand's initState directly
            initRFPState(rfps)
    }
}