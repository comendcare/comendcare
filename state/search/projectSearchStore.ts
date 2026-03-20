import { typesense } from '@comend/lib/typesense';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { mixpanelTrack } from "@comend/lib/mixpanel";
import { SearchResponse } from 'typesense/lib/Typesense/Documents';
import { BadgeVariantType } from '@comend/lib/types';

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    types: {
        label: string,
        value: string,
        disable?: boolean,
        variant?: BadgeVariantType
    }[],
    status: {
        label: string,
        value: string,
        disable?: boolean,
        variant?: BadgeVariantType
    }[],
    budgetRange: number[]
}

export const defaultFilters = {
    types: [],
    status: [],
    budgetRange: [0, 1000000000],
}

function generateFiltersString(filters: FiltersType): string {
    let filtersList: string[] = [];

    const escapeValue = (value: string) => `\`${value}\``;

    // type
    if (filters?.types && filters.types.length > 0) {
        const stageFilter = filters.types
            .map(type => `types.milestoneTypeId:=[${escapeValue(type.value)}]`)
            .join(" || ");
            filtersList.push(`(${stageFilter})`);
    }

    // statuses
    if (filters?.status && filters.status.length > 0) {
        const statusFilter = filters.status
            .map(status => `status:=[${escapeValue(status.value)}]`)
            .join(" || ");
            filtersList.push(`(${statusFilter})`);
    }

    // budget range
    // if (filters?.budgetRange) {
    //     const budgetFilter = `budget:=[${filters.budgetRange[0]}..${filters.budgetRange[1]}]`
    //     filtersList.push(`(${budgetFilter})`)
    // }

    // Combine all filters with `&&`
    const typesenseFilters = filtersList.length > 0 ? filtersList.join(" && ") : "";

    console.log(`Typesense filters: ${typesenseFilters}`);
    return typesenseFilters;
}

const sortByFilters: { [key: string]: string } = {
    "default": "updatedAt:desc",
    "budget-low-high": "budget:asc",
    "budget-high-low": "budget:desc"
}

const getUpdatedSearchResults = async (state: any, isNewSearch: boolean = true): Promise<{results: any[], total: number}> => {
    try {
        const TAG_PRIORITY_SORT = "";
        const filtersString = generateFiltersString(state.filters)

        // Merge tag-priority sort with user-chosen sort
        let sortBy = TAG_PRIORITY_SORT;
        if (state.sortBy && sortByFilters[state.sortBy]) {
            sortBy += `,${sortByFilters[state.sortBy]}`;
        }

        const searchParameters = {
            q: state.searchTerm,
            query_by: "organization.name,title,description,types.milestoneTypeId,companies.company.title,institutions.institution.name,attachments.name",
            per_page: 12,
            page: state.lastFetchedPage,
            ...(filtersString ? { filter_by: filtersString } : undefined),
            ...(state.sortBy ? {sort_by: sortByFilters[state.sortBy]} : undefined),
        };

        const results: SearchResponse<Object> = await typesense
            .collections("projects")
            .documents()
            .search(searchParameters);

        const typeSenseHits = results.hits || [];
        // @ts-ignore
        const ids = typeSenseHits.map(hit => hit.document.id);

        if (ids.length === 0) {
            return {
                results: isNewSearch ? [] : state.searchResults,
                total: results.found || 0
            }
        }

        const prismaResponse = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        if (!prismaResponse.ok) {
            const text = await prismaResponse.text() // may be empty or HTML on 405
            throw new Error(`POST /api/projects failed: ${prismaResponse.status} ${text}`)
        }

        const prismaResults = await prismaResponse.json();

        const enrichedResults = ids.map((id: string) => prismaResults.find((org: any) => org.id === id) || null).filter(Boolean);

        return {
            results: isNewSearch ? enrichedResults : [...state.searchResults, ...enrichedResults],
            total: results.found || 0,
        };
    } catch (error) {
        console.error("Search error:", error);
        return {
            results: [],
            total: 0
        }
    }
};

export interface ProjectSearchState {
    initialized: boolean,
    setInit: (initState: boolean) => void,
    initState: (filters: FiltersType) => Promise<void>,
    searchTerm: string,
    setSearchTerm: (newSearch: string) => void,
    sortBy: string
    setSortBy: (sortBy: string) => void,
    lastFetchedPage: number,
    setLastFetchedPage: (page: number) => void,
    view: ViewType,
    setView: (view: ViewType) => void,
    allResults: any[],
    setAllResults: (results: any[]) => void,
    searchResults: any[] | undefined
    setSearchResults: (results: any[]) => void
    filters: FiltersType,
    setFilters: (updatedFilters: FiltersType) => Promise<void>,
    totalResults: undefined | number,
    setTotalResults: (total: number) => void,
}

export const useProjectSearchStore = create<ProjectSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            setInit: (initState: boolean) => {
                set({initialized: initState})
            },
            initState: async (filters: FiltersType) => {
                set({
                    searchTerm: "",
                    sortBy: "default",
                    lastFetchedPage: 1,
                    filters,
                })

                const {results: newSearchResults, total} = await getUpdatedSearchResults({
                    ...get(),
                    searchTerm: "",
                    lastFetchedPage: 1,
                }, true)

                set({
                    searchTerm: "",
                    searchResults: newSearchResults,
                    lastFetchedPage: 1,
                    totalResults: total,
                    initialized: true,
                })
            },
            searchTerm: '',
            setSearchTerm: async (newSearch: string) => {
                const {results: newSearchResults, total} = await getUpdatedSearchResults({
                    ...get(),
                    searchTerm: newSearch,
                    lastFetchedPage: 1,
                }, true)

                if (newSearch.length > 0) {
                    // only track searches if the user has entered text in the searchbar
                    const filters = get().filters
                    mixpanelTrack("Search projects", {
                        "Search Term": newSearch,
                        "Results": total,
                        "Filters": {}
                    })
                }

                set({
                    searchTerm: newSearch,
                    searchResults: newSearchResults,
                    lastFetchedPage: 1,
                    totalResults: total,
                })
            },
            sortBy: "default",
            setSortBy: async (sortBy: string) => {
                const {results: newSearchResults, total} = await getUpdatedSearchResults({
                    ...get(),
                    sortBy,
                    lastFetchedPage: 1,
                }, true)
                set({sortBy, searchResults: newSearchResults, lastFetchedPage: 1, totalResults: total})
            },
            lastFetchedPage: 1, // page numbers in TypeSense start at 1
            setLastFetchedPage: async (page: number) => {
                const {results: updateSearchResults} = await getUpdatedSearchResults({
                    ...get(),
                    lastFetchedPage: page
                }, false)
                set({lastFetchedPage: page, searchResults: updateSearchResults})
            },
            view: 'grid',
            setView: (view: ViewType) => set({ view }),
            allResults: [],
            setAllResults: (results: any[]) => set({ allResults: results }),
            searchResults: undefined,
            setSearchResults: (results: any[]) => set({ searchResults: results }),
            filters: defaultFilters,
            setFilters: async (updatedFilters: FiltersType) => {
                const newFilters = {
                    ...get().filters,
                    ...updatedFilters
                }

                const {results: newSearchResults, total} = await getUpdatedSearchResults({
                    ...get(),
                    filters: newFilters,
                    lastFetchedPage: 1,
                }, true)

                set({
                    filters: newFilters,
                    lastFetchedPage: 1,
                    searchResults: newSearchResults,
                    totalResults: total,
                })
            },
            totalResults: undefined,
            setTotalResults: (total: number) => set({ totalResults: total }),
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
    )
