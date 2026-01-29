import { typesense } from '@comend/lib/typesense';
import { nanoid } from 'nanoid';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { ASSOCIATED_CATEGORIES, Milestone } from '@comend/lib/types'
import { getExclusiveToFirstGroup, sleep, typesenseSortByFromColumnId } from '@comend/lib/utils';
import { mixpanelTrack } from "@comend/lib/mixpanel";
import { SearchResponse } from 'typesense/lib/Typesense/Documents';

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    stages: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    statuses: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    modalities: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
}

export const defaultFilters = {
    stages: [],
    statuses: [],
    modalities: []
}

function generateFiltersString(filters: FiltersType): string {
    let filtersList: string[] = [];

    const escapeValue = (value: string) => `\`${value}\``;

    // stages
    if (filters?.stages && filters.stages.length > 0) {
        const stageFilter = filters.stages
            .map(stage => `stages:=[${escapeValue(stage.label)}]`)
            .join(" || ");
            filtersList.push(`(${stageFilter})`);
    }

    // statuses
    if (filters?.statuses && filters.statuses.length > 0) {
        const statusFilter = filters.statuses
            .map(status => `statuses:=[${escapeValue(status.label)}]`)
            .join(" || ");
            filtersList.push(`(${statusFilter})`);
    }

    // modalities/therapeutic strategies
    if (filters?.modalities && filters.modalities.length > 0) {
        const modalitiesFilter = filters.modalities
            .map(status => `modalities:=[${escapeValue(status.label)}]`)
            .join(" || ");
            filtersList.push(`(${modalitiesFilter})`);
    }

    // Combine all filters with `&&`
    const typesenseFilters = filtersList.length > 0 ? filtersList.join(" && ") : "";

    console.log(`Typesense filters: ${typesenseFilters}`);
    return typesenseFilters;
}

const sortByFilters: { [key: string]: string } = {
    "default": "updatedAt:desc",
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 2,          // usually 2 extra attempts
  waitMs = 150           // small backoff
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (attempts <= 0) throw err;
    await new Promise(r => setTimeout(r, waitMs));
    return withRetry(fn, attempts - 1, waitMs * 2);
  }
}

const getUpdatedSearchResults = async (
    state: any,
    isNewSearch: boolean = true
): Promise<{results: any[], total: number, totalPages: number}> => {
    const getResults = async (
        state: any,
        isNewSearch: boolean = true
    ) => {
        let sortByList = []
        const filtersString = generateFiltersString(state.filters)

        if (state.sortBy) {
            const parsedSort = JSON.parse(state.sortBy)

            if (parsedSort && Array.isArray(parsedSort)) {
                parsedSort.map((sort: any) => {
                    sortByList.push(`${typesenseSortByFromColumnId(sort.id, sort.desc)}`)
                })
            }
        }

        sortByList.push(`updatedAt:desc`)
        const sortBy = sortByList.join(`,`)

        const searchParameters = {
            q: state.searchTerm,
            query_by: "organization.name,title,description,modalities,links.name,links.link,partners.affiliation,stages,statuses",
            per_page: state.resultsPerPage,
            page: state.page,
            ...(filtersString ? { filter_by: filtersString } : undefined),
            sort_by: sortBy,
        };

        const results: SearchResponse<Object> = await typesense
            .collections("research-plans")
            .documents()
            .search(searchParameters);

        const typeSenseHits = results.hits || [];
        // @ts-ignore
        const ids = typeSenseHits.map(hit => hit.document.id);

        const totalResults = results.found || 0;
        const totalPages = Math.ceil(totalResults / state.resultsPerPage);

        if (ids.length === 0) {
            return {
                results: isNewSearch ? [] : state.searchResults,
                total: results.found || 0,
                totalPages: Math.ceil(results.out_of/12)
            }
        }

        const prismaResponse = await fetch('/api/research-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        if (!prismaResponse.ok) {
            const text = await prismaResponse.text() // may be empty or HTML on 405
            throw new Error(`POST /api/research-plans failed: ${prismaResponse.status} ${text}`)
        }

        const prismaResults = await prismaResponse.json();

        const enrichedResults = ids.map((id: string) => prismaResults.find((company: any) => company.id === id) || null).filter(Boolean);

        return {
            results: enrichedResults,
            total: results.found || 0,
            totalPages: totalPages || 0
        };
    }

    return await withRetry(() => getResults(state, isNewSearch))
};

export interface ResearchPlanSearchState {
    initialized: boolean,
    setInit: (initState: boolean) => void,
    initState: (filters: FiltersType, sortBy?: string | string[] | undefined) => Promise<void>,
    searchTerm: string,
    setSearchTerm: (newSearch: string) => void,
    sortBy: string | string[] | undefined,
    setSortBy: (sortBy: string | string[] | undefined) => void,
    resultsPerPage: number,
    setResultsPerPage: (numResults: number) => void,
    page: number,
    setPage: (page: number) => void,
    totalPages: number,
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

export const useResearchPlanSearchStore = create<ResearchPlanSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            setInit: (initState: boolean) => {
                set({initialized: initState})
            },
            initState: async (filters: FiltersType, sortBy?: string | string[] | undefined) => {
                set({ 
                    filters,
                    searchTerm: "",
                    sortBy,
                    page: 1,
                })

                const { results, total, totalPages } = await getUpdatedSearchResults(get(), true)

                set({
                    searchResults: results,
                    totalPages,
                    totalResults: total,
                    initialized: true,
                })
            },
            searchTerm: '',
            setSearchTerm: async (newSearch: string) => {
                const { results, total, totalPages } = await getUpdatedSearchResults({
                    ...get(),
                    searchTerm: newSearch,
                }, true)

                if (newSearch.length > 0) {
                    // only track searches if the user has entered text in the searchbar
                    const filters = get().filters
                    mixpanelTrack("Search research plans", {
                        "Search Term": newSearch,
                        "Results": total,
                        "Filters": {
                            // "Types": filters.modalities?.map(filter => filter.label),
                            // "Business Types": filters.types.map(filter => filter.label),
                            // "Certifications": filters.certifications.map(filter => filter.label),
                            // "Tags": filters.tags.map(filter => filter.label),
                            // "Categories": filters.categories.map(filter => filter.label)
                        }
                    })
                }

                set({
                    searchTerm: newSearch,
                    searchResults: results,
                    totalPages,
                    page: 1,
                    totalResults: total,
                })
            },
            sortBy: undefined,
            setSortBy: async (sortBy: string | string[] | undefined) => {
                // if new sort by value == previous sort by value, don't update
                if (JSON.stringify(get().sortBy) === JSON.stringify(sortBy)) return

                const { results, total, totalPages } = await getUpdatedSearchResults({
                    ...get(),
                    sortBy,
                }, true)
                set({ sortBy, searchResults: results, totalPages, page: 1, totalResults: total })
            },
            resultsPerPage: 10,
            setResultsPerPage: async (numResults: number) => {
                const {results: updateSearchResults, totalPages} = await getUpdatedSearchResults({
                    ...get(),
                    resultsPerPage: numResults,
                    page: 1
                }, false)
                set({ resultsPerPage: numResults, page: 1, totalPages, searchResults: updateSearchResults })
            },
            totalPages: 1,
            page: 1, // page numbers in TypeSense start at 1
            setPage: async (page: number) => {
                const {results: updateSearchResults, totalPages} = await getUpdatedSearchResults({
                    ...get(),
                    page,
                }, false)
                set({ page, totalPages, searchResults: updateSearchResults })
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
                const { results, total, totalPages } = await getUpdatedSearchResults({
                    ...get(),
                    filters: newFilters,
                    lastFetchedPage: 1,
                }, true)

                set({
                    filters: newFilters,
                    page: 1,
                    searchResults: results,
                    totalResults: total,
                    totalPages,
                })
            },
            totalResults: undefined,
            setTotalResults: (total: number) => set({ totalResults: total }),
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
    )
