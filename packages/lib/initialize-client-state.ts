"use client";

import { useRoadmapStore } from "../../apps/web/state/roadmap/roadmapStore";
import { PlatformNotification, Prisma } from "@prisma/client";
import { useNotificationsStore } from "../../state/notifications/notificationsStore";
import { useMilestoneSearchStore } from "../../state/search/milestoneSearchStore";
import { FiltersType as CROMarketplaceFiltersType, useCROSearchStore} from "../../state/search/croSearchStore";
import { FiltersType as PAGMarketplaceFiltersType, useOrganizationSearchStore} from "../../state/search/organizationSearchStore";
import { FiltersType as BiosampleMarketplaceFiltersType, useBiosampleSearchStore} from "../../state/search/biosampleSearchStore";
import { FiltersType as DiseaseModelMarketplaceFiltersType, useDiseaseModelSearchStore} from "../../state/search/diseaseModelSearchStore";
import { FiltersType as ClinicalDatasetMarketplaceFiltersType, useClinicalDatasetSearchStore} from "../../state/search/clinicalDatasetSearchStore";
import { FiltersType as RFPMarketplaceFiltersType, useRFPSearchStore} from "../../state/search/rfpSearchStore";
import { FiltersType as ResearchPlanMarketplaceFiltersType, useResearchPlanSearchStore} from "../../state/search/researchPlanSearchStore";
import { FiltersType as ResearcherMarketplaceFiltersType, useResearcherSearchStore} from "../../state/search/researcherSearchStore";
import { Asset, RFP, Roadmap } from './types';
import { useToolStore } from "../../state/tool/toolStore";
import { useRFPStore } from "../../state/rfp/rfpStore";

export async function initializeCROSearch(filters: CROMarketplaceFiltersType) {
    if (typeof window !== "undefined") {
        const initCROSearchState = useCROSearchStore.getState().initState;

        // Call Zustand's initState directly
        await initCROSearchState(filters)
    }
}

export async function initializeRFPSearch(filters: RFPMarketplaceFiltersType) {
    if (typeof window !== "undefined") {
        const initRFPSearchState = useRFPSearchStore.getState().initState;

        // Call Zustand's initState directly
        await initRFPSearchState(filters)
    }
}

export async function initializeResearchPlanSearch(filters: ResearchPlanMarketplaceFiltersType) {
    if (typeof window !== "undefined") {
        const initResearchPlanSearchState = useResearchPlanSearchStore.getState().initState;

        // Call Zustand's initState directly
        await initResearchPlanSearchState(filters)
    }
}

export async function initializeResearcherSearch(filters: ResearcherMarketplaceFiltersType) {
    if (typeof window !== "undefined") {
        const initResearcherSearchState = useResearcherSearchStore.getState().initState;

        // Call Zustand's initState directly
        await initResearcherSearchState(filters)
    }
}

export function initializeMilestoneSearch() {
    if (typeof window !== "undefined") {
        const initMilestoneSearchState = useMilestoneSearchStore.getState().initState;

        // Call Zustand's initState directly
        initMilestoneSearchState()
    }
}

export async function initializeOrganizationSearch(filters: PAGMarketplaceFiltersType) {
    if (typeof window !== "undefined") {
        const initOrganizationSearchState = useOrganizationSearchStore.getState().initState;

        // Call Zustand's initState directly
        await initOrganizationSearchState(filters)
    }
}

export async function initializeBiosampleSearch(filters: BiosampleMarketplaceFiltersType, sortBy?: string | string[] | undefined) {
    if (typeof window !== "undefined") {
        const initBiosampleSearchState = useBiosampleSearchStore.getState().initState;

        // Call Zustand's initState directly
        await initBiosampleSearchState(filters, sortBy)
    }
}

export async function initializeDiseaseModelSearch(filters: DiseaseModelMarketplaceFiltersType, sortBy?: string | string[] | undefined) {
    if (typeof window !== "undefined") {
        const initDiseaseModelSearchState = useDiseaseModelSearchStore.getState().initState;

        // Call Zustand's initState directly
        await initDiseaseModelSearchState(filters, sortBy)
    }
}

export async function initializeClinicalDatasetSearch(filters: ClinicalDatasetMarketplaceFiltersType, sortBy?: string | string[] | undefined) {
    if (typeof window !== "undefined") {
        const initClinicalDatasetSearchState = useClinicalDatasetSearchStore.getState().initState;

        // Call Zustand's initState directly
        await initClinicalDatasetSearchState(filters, sortBy)
    }
}

export function initializeRoadmapState(initData: {
    roadmapId: string | null | undefined
    details: Roadmap | undefined
    nodes: any[]
    edges: any[]
    milestones: any[]
    selectedView?: string | null
    selectedNodeIds: string[]
}) {
    const { clear } = useRoadmapStore.temporal.getState()

    if (typeof window !== "undefined") {
        const initRoadmapState = useRoadmapStore.getState().initState;
        const { roadmapId, details, nodes, edges, milestones, selectedView, selectedNodeIds } = initData;

        const newNodes = nodes.map(node => ({
            ...node,
            position: {
                x: node.positionX,
                y: node.positionY
            }
        }))

        // Call Zustand's initState directly
        initRoadmapState(details, newNodes, edges, milestones, selectedView || null, selectedNodeIds, null, roadmapId || "")
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

export function initializeAssetsStore(tools: Asset[]) {
    if (typeof window !== "undefined") {
        const initAssetState = useToolStore.getState().initState;

        // Call Zustand's initState directly
        initAssetState(tools)
    }
}

export function initializeRFPStore(rfps: RFP[]) {
    if (typeof window !== "undefined") {
        const initRFPState = useRFPStore.getState().initState;

            // Call Zustand's initState directly
            initRFPState(rfps)
    }
}
