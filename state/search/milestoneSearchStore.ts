import { create } from 'zustand';

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    milestoneTypes: string[],
    milestoneStatus: string[],
    milestoneOutcomes: string[],
}

export const defaultFilters = {
    milestoneTypes: [],
    milestoneStatus: [],
    milestoneOutcomes: [],
}

export interface MilestoneSearchState {
    view: ViewType,
    setView: (view: ViewType) => void,
    allResults: any[],
    setAllResults: (results: any[]) => void,
    searchResults: any[]
    setSearchResults: (results: any[]) => void
    filters: FiltersType,
    setFilters: (updatedFilters: FiltersType) => void
}

export const useMilestoneSearchStore = create<MilestoneSearchState>((set, get) => ({
    view: 'grid',
    setView: (view: ViewType) => set({ view }),
    allResults: [],
    setAllResults: (results: any[]) => set({ allResults: results }),
    searchResults: [],
    setSearchResults: (results: any[]) => set({ searchResults: results }),
    filters: defaultFilters,
    setFilters: (updatedFilters: FiltersType) => {
        set({ filters: {
            ...get().filters,
            ...updatedFilters
        }})
    }
}));