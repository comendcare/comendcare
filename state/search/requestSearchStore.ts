import {typesense} from '@comend/lib/typesense';
import {temporal} from 'zundo';
import {create} from 'zustand';
import { getExclusiveToFirstGroup } from '@comend/lib/utils';
import { mixpanelTrack } from "@comend/lib/mixpanel";
import { RequestFiltersType } from '@/packages/lib/types';
import { getRequests } from '@/packages/lib/fetchers';

export type ViewType = 'grid' | 'list'

export const defaultFilters = {
    statuses: [],
    types: [],
}

function generateFiltersString(filters: RequestFiltersType) {
    let filtersList: string[] = []
    let typesenseFilters = ""

    // addative filters
    if (filters.statuses.length > 0) {
        filters.statuses.forEach(system => {
            filtersList.push(`status:=[${system.value}]`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}condition.condition.associatedSystems:=[${system.value}]`)
        })
    }

    if (filters.types.length > 0) {
        filters.types.forEach(system => {
            filtersList.push(`type:=[${system.value}]`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}condition.condition.associatedSystems:=[${system.value}]`)
        })
    }

    if (typesenseFilters.length > 0) typesenseFilters = typesenseFilters.concat(")")

    console.log(`typesense filters: `, typesenseFilters)
    return typesenseFilters
}

const sortByFilters: { [key: string]: string } = {
    "recently-updated": "updatedAt:desc",
    "newest-created": "createdAt:desc",
    "oldest-created": "createdAt:asc",
}

const getUpdatedSearchResults = async (state: any, isNewSearch: boolean = true): Promise<{results: any[], total: number}> => {
    try {
        const searchParameters = {
            q: state.searchTerm,
            query_by: "name,description",
            per_page: 10,
            page: state.lastFetchedPage,
            ...(generateFiltersString(state.filters) ? {filter_by: generateFiltersString(state.filters)} : undefined),
            ...(state.sortBy ? {sort_by: sortByFilters[state.sortBy]} : undefined),
        };

        const results = await typesense
            .collections("organizations")
            .documents()
            .search(searchParameters);

        // return isNewSearch ? results.hits : state.searchResults

        const typeSenseHits = results.hits || [];
        // @ts-ignore
        const ids = typeSenseHits.map(hit => hit.document.id);

        if (ids.length === 0) {
            return {
                results: isNewSearch ? [] : state.searchResults,
                total: results.found || 0
            }
        }

        const prismaResponse = await fetch('/api/organizations', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ids}),
        });

        const prismaResults = await prismaResponse.json();

        const enrichedResults = ids.map(id => prismaResults.find((org: any) => org.id === id) || null).filter(Boolean);

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

export interface OrganizationSearchState {
    initialized: boolean,
    initState: (filters: RequestFiltersType) => void,
    searchTerm: string,
    setSearchTerm: (newSearch: string) => void,
    sortBy: string,
    setSortBy: (sortBy: string | undefined) => void,
    lastFetchedPage: number,
    setLastFetchedPage: (page: number) => void,
    view: ViewType,
    setView: (view: ViewType) => void,
    allResults: any[],
    setAllResults: (results: any[]) => void,
    searchResults: any[] | undefined
    setSearchResults: (results: any[]) => void
    filters: RequestFiltersType,
    setFilters: (updatedFilters: Partial<RequestFiltersType>) => void,
    totalResults: undefined | number,
    setTotalResults: (total: number) => void,
}

export const useRequestSearchStore = create<OrganizationSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: (filters: RequestFiltersType) => {
                set({initialized: true, filters})
            },
            searchTerm: '',
            setSearchTerm: async (newSearch: string) => {
                const response = await getRequests({
                    searchTerm: newSearch,
                    filters: get().filters,
                    sortBy: get().sortBy,
                    page: 1,
                })

                mixpanelTrack("Search Requests", {
                    "Search Term": newSearch,
                    "Results": response.total,
                    "Filters": {
                        "Statuses": get().filters.statuses.map(s => s.label),
                        "Types": get().filters.types.map(t => t.label),
                    }
                })

                set({
                    searchTerm: newSearch,
                    searchResults: response.data,
                    lastFetchedPage: 1,
                    totalResults: response.total,
                })
            },
            sortBy: "recently-updated",
            setSortBy: async (sortBy: string | undefined) => {
                const response = await getRequests({
                    searchTerm: get().searchTerm,
                    filters: get().filters,
                    sortBy,
                    page: 1,
                })
                set({
                    sortBy,
                    searchResults: response.data,
                    lastFetchedPage: 1,
                    totalResults: response.total,
                })
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
            setView: (view: ViewType) => set({view}),
            allResults: [],
            setAllResults: (results: any[]) => set({allResults: results}),
            searchResults: undefined,
            setSearchResults: (results: any[]) => set({searchResults: results}),
            filters: defaultFilters,
            setFilters: async (updatedFilters: Partial<RequestFiltersType>) => {
                const newFilters = {
                    ...get().filters,
                    ...updatedFilters
                }

                const response = await getRequests({
                    searchTerm: get().searchTerm,
                    filters: newFilters,
                    sortBy: get().sortBy,
                    page: 1,
                })

                const recentlySelected = {
                    statuses: getExclusiveToFirstGroup(newFilters, get().filters, 'statuses'),
                    types: getExclusiveToFirstGroup(newFilters, get().filters, 'types'),
                }

                const recentlyRemoved = {
                    statuses: getExclusiveToFirstGroup(get().filters, newFilters, 'statuses'),
                    types: getExclusiveToFirstGroup(get().filters, newFilters, 'types'),
                }

                if (
                    Object.values(recentlySelected).flatMap(value => value).length > 0 ||
                    Object.values(recentlyRemoved).flatMap(value => value).length > 0
                ) {
                    // only track in mixpanel if something in the filters has been updated
                    mixpanelTrack("Researcher Requests Page Filters", {
                        "Results": response.data.length,
                        "Filters": {
                            "Statuses": newFilters.statuses.map(filter => filter.label),
                            "Types": newFilters.types.map(filter => filter.label),
                        },
                        "Added": {
                            "Statuses": recentlySelected.statuses.map(filter => filter.label),
                            "Types": recentlySelected.types.map(filter => filter.label),
                        },
                        "Removed": {
                            "Statuses": recentlyRemoved.statuses.map(filter => filter.label),
                            "Types": recentlyRemoved.types.map(filter => filter.label),
                        },
                    })
                }

                set({
                    filters: newFilters,
                    lastFetchedPage: 1,
                    searchResults: response.data,
                    totalResults: response.data.length,
                })
            },
            totalResults: undefined,
            setTotalResults: (total: number) => set({totalResults: total}),
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
)
