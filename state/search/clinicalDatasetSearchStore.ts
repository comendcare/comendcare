import { typesense } from '@comend/lib/typesense';
import { nanoid } from 'nanoid';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { ASSOCIATED_CATEGORIES, Milestone } from '@comend/lib/types'
import { getExclusiveToFirstGroup, typesenseSortByFromColumnId } from '@comend/lib/utils';
import { mixpanelTrack } from "@comend/lib/mixpanel";

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    conditions: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    genes: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    types: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    organizations: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
}

export const defaultFilters = {
    conditions: [],
    genes: [],
    types: [],
    organizations: []
}

export type Recommendation = {
    content: any
    milestone: Milestone
}

function generateFiltersString(filters: FiltersType): string {
    let filtersList: string[] = [];

    const escapeValue = (value: string) => `\`${value}\``;

    // conditions
    if (filters?.conditions && filters.conditions.length > 0) {
        const conditionFilter = filters.conditions
            .map(condition => `organization.conditions.condition.name:=[${escapeValue(condition.value)}]`)
            .join(" || ");
        filtersList.push(`(${conditionFilter})`);
    }

    // genes
    if (filters?.genes && filters.genes.length > 0) {
        const geneFilter = filters.genes
            .map(gene => `genes:=${escapeValue(gene.value)}`)
            .join(" || ");
        filtersList.push(`(${geneFilter})`);
    }

    // Clinical Dataset Types (Array Field)
    if (filters?.types && filters.types.length > 0) {
        const typeFilter = filters.types
            .map(type => `type.value:=[${escapeValue(type.value)}]`)
            .join(" || ");
        filtersList.push(`(${typeFilter})`);
    }

    // Organizations
    if (filters?.organizations && filters.organizations.length > 0) {
        const organizationFilter = filters.organizations
            .map(organization => `organization.id:=[${escapeValue(organization.value)}]`)
            .join(" || ");
        filtersList.push(`(${organizationFilter})`);
    }

    // Combine all filters with `&&`
    const typesenseFilters = filtersList.length > 0 ? filtersList.join(" && ") : "";

    console.log(`Typesense filters: ${typesenseFilters}`);
    return typesenseFilters;
}

const getUpdatedSearchResults = async (
    state: any,
    isNewSearch: boolean = true
): Promise<{results: any[], total: number, totalPages: number}> => {
    try {
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

        sortByList.push(`fieldsFilled:desc,createdAt:desc`)
        const sortBy = sortByList.join(`,`)

        console.log(`SORT BY`, sortBy)

        const searchParameters = {
            q: state.searchTerm,
            query_by: "title,description,genes,type.label,organization.conditions.condition.name,organization,institution.name",
            per_page: state.resultsPerPage,
            page: state.page,
            ...(filtersString ? { filter_by: filtersString } : undefined),
            sort_by: sortBy,
        };

        const results = await typesense
            .collections("clinical-datasets")
            .documents()
            .search(searchParameters);

        console.log(`TYPESENSE RESULTS`, results)

        // return isNewSearch ? results.hits : state.searchResults

        const typeSenseHits = results.hits || [];
        // @ts-ignore
        const ids = typeSenseHits.map(hit => hit.document.id);

        const totalResults = results.found || 0;
        const totalPages = Math.ceil(totalResults / state.resultsPerPage);

        if (ids.length === 0) {
            // return isNewSearch ? [] : state.searchResults;
            return {
                results: isNewSearch ? [] : state.searchResults,
                total: results.found || 0,
                totalPages: totalPages || 0
            }
        }

        const prismaResponse = await fetch('/api/clinical-datasets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        console.log(`prisma response...`, prismaResponse)

        if (!prismaResponse.ok) {
            const text = await prismaResponse.text() // may be empty or HTML on 405
            throw new Error(`POST /api/clinical-datasets failed: ${prismaResponse.status} ${text}`)
        }

        const prismaResults = await prismaResponse.json();

        const enrichedResults = ids.map((id: string) => prismaResults.find((company: any) => company.id === id) || null).filter(Boolean);

        return {
            results: enrichedResults,
            total: results.found || 0,
            totalPages: totalPages || 0
        };

    } catch (error) {
        console.error("Search error:", error);
        return {
            results: [],
            total: 0,
            totalPages: 0
        };
    }
};

export interface ClinicalDatasetSearchState {
    initialized: boolean,
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
    setFilters: (updatedFilters: FiltersType) => void,
    recommendations: Recommendation[] | undefined
    // setRecommendations: (milestones: Milestone[], options?: SetRecommendationsOptions) => Promise<Recommendation[]>,
    totalResults: undefined | number,
    setTotalResults: (total: number) => void,
}

export const useClinicalDatasetSearchStore = create<ClinicalDatasetSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: async (filters: FiltersType, sortBy?: string | string[] | undefined) => {
                set({ 
                    recommendations: [], 
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
                    page: 1,
                }, true)

                if (newSearch.length > 0) {
                    // only track searches if the user has entered text in the searchbar
                    const filters = get().filters
                    mixpanelTrack("Search Clinical Datasets", {
                        "Search Term": newSearch,
                        "Results": total,
                        "Filters": {
                            "Types": filters.types?.map(filter => filter.label),
                        }
                    })
                }

                set({
                    searchTerm: newSearch,
                    searchResults: results,
                    page: 1,
                    totalResults: total,
                    totalPages
                })
            },
            sortBy: undefined,
            setSortBy: async (sortBy: string | string[] | undefined) => {
                // if new sort by value == previous sort by value, don't update
                if (JSON.stringify(get().sortBy) === JSON.stringify(sortBy)) return

                const { results, total, totalPages } = await getUpdatedSearchResults({
                    ...get(),
                    sortBy,
                    page: 1,
                }, true)
                set({ sortBy, searchResults: results, page: 1, totalResults: total, totalPages })
            },
            resultsPerPage: 10,
            setResultsPerPage: async (numResults: number) => {
                const {results: updateSearchResults, totalPages} = await getUpdatedSearchResults({
                    ...get(),
                    resultsPerPage: numResults,
                    page: 1
                }, false)
                set({ resultsPerPage: numResults, page: 1, searchResults: updateSearchResults, totalPages })
            },
            totalPages: 1,
            page: 1, // page numbers in TypeSense start at 1
            setPage: async (page: number) => {
                const {results: updateSearchResults, totalPages} = await getUpdatedSearchResults({
                    ...get(),
                    page,
                }, false)
                set({ page, searchResults: updateSearchResults, totalPages })
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

                // if the filters are the same, don't update them
                if (JSON.stringify(newFilters) === JSON.stringify(get().filters)) return
            
                const { results, total, totalPages } = await getUpdatedSearchResults({
                    ...get(),
                    filters: newFilters,
                    page: 1,
                }, true)

                const recentlySelected = {
                    types: getExclusiveToFirstGroup(newFilters, get().filters, 'types'),
                }

                const recentlyRemoved = {
                    types: getExclusiveToFirstGroup(get().filters, newFilters, 'types'),
                }

                if (Object.values(recentlySelected).flatMap(value => value).length > 0 || Object.values(recentlyRemoved).flatMap(value => value).length > 0) {
                    // if something has been added or removed, track as a mixpanel event
                    mixpanelTrack("Marketplace Clinical Datasets Filters Selected", {
                        "Results": total,
                        "Filters": {
                            "Types": newFilters.types.map(filter => filter.label),
                        },
                        "Added": {
                            "Types": recentlySelected.types.map(filter => filter.label),
                        },
                        "Removed": {
                            "Types": recentlyRemoved.types.map(filter => filter.label),
                        },
                    })
                }

                set({
                    filters: newFilters,
                    page: 1,
                    searchResults: results,
                    totalResults: total,
                    totalPages
                })
            },
            recommendations: undefined,
            // setRecommendations: async (milestones: Milestone[], options?: SetRecommendationsOptions) => {
            //     console.log(`get recommendations`, options)
            //     set({recommendations: undefined})
            //     const recommendationResults = await generateRecommendations(
            //         options?.priority
            //             // ? milestones.sort(function(x,y){ return x == first ? -1 : y == first ? 1 : 0; })
            //             ? milestones.sort((x, y) => x.id === options.priority ? -1 : y.id === options.priority ? 1 : 0)
            //             : milestones
            //     )

            //     // remove duplicates before returning
            //     const prunedRecommendations = options?.limit
            //         ? Array.from(new Set(recommendationResults)).slice(0, options.limit)
            //         : Array.from(new Set(recommendationResults))

            //     set({
            //         recommendations: prunedRecommendations
            //     })
            //     return prunedRecommendations
            // },
            totalResults: undefined,
            setTotalResults: (total: number) => set({ totalResults: total }),
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
    )
