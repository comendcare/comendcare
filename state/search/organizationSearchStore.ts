import { create } from 'zustand';

export interface OrganizationSearchState {
    searchResults: any[]
    setSearchResults: (results: any[]) => void
}

export const useOrganizationSearchStore = create<OrganizationSearchState>((set) => ({
    searchResults: [],
    setSearchResults: (results: any[]) => set({ searchResults: results })
}));