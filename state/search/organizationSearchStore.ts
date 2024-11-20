import { create } from 'zustand';

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    genes?: string[] | undefined
    patientsRange?: number[] | undefined // [low, high]
}

export interface OrganizationSearchState {
    view: ViewType,
    setView: (view: ViewType) => void,
    searchResults: any[]
    setSearchResults: (results: any[]) => void
    filters: FiltersType,
    setFilters: (updatedFilters: FiltersType) => void
}

export const useOrganizationSearchStore = create<OrganizationSearchState>((set, get) => ({
    view: 'grid',
    setView: (view: ViewType) => set({ view }),
    searchResults: [],
    setSearchResults: (results: any[]) => set({ searchResults: results }),
    filters: {
        genes: [],
        patientsRange: [0, 100]
    },
    setFilters: (updatedFilters: FiltersType) => {
        console.log(`update filters:`, updatedFilters)
        set({ filters: {
            ...get().filters,
            ...updatedFilters
        }})
    }
}));