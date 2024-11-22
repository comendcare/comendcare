import { create } from 'zustand';

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    modalities: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    categories: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    moneyDeployed: number[],
    milestoneTypes: string[],
    genes: {
        label: string,
        value: string,
        disable?: boolean,
    }[]
}

export const defaultFilters = {
    modalities: [],
    categories: [],
    moneyDeployed: [0, 10000000],
    milestoneTypes: [],
    genes: []
}

export interface OrganizationSearchState {
    view: ViewType,
    setView: (view: ViewType) => void,
    allResults: any[],
    setAllResults: (results: any[]) => void,
    searchResults: any[]
    setSearchResults: (results: any[]) => void
    filters: FiltersType,
    setFilters: (updatedFilters: FiltersType) => void
}

export const useOrganizationSearchStore = create<OrganizationSearchState>((set, get) => ({
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