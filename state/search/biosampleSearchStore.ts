import { typesense } from '@comend/lib/typesense';
import { nanoid } from 'nanoid';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { ASSOCIATED_CATEGORIES, Milestone } from '@comend/lib/types'
import { getExclusiveToFirstGroup } from '@comend/lib/utils';
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
}

export const defaultFilters = {
    conditions: [],
    genes: [],
    types: [],
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
            .map(condition => `conditions:=[${escapeValue(condition.value)}]`)
            .join(" || ");
        filtersList.push(`(${conditionFilter})`);
    }

    // genes
    if (filters?.genes && filters.genes.length > 0) {
        const geneFilter = filters.genes
            .map(gene => `gene:=[${escapeValue(gene.value)}]`)
            .join(" || ");
        filtersList.push(`(${geneFilter})`);
    }

    // Biosample Types (Array Field)
    if (filters?.types && filters.types.length > 0) {
        const typeFilter = filters.types
            .map(type => `types.value:=[${escapeValue(type.value)}]`)
            .join(" || ");
        filtersList.push(`(${typeFilter})`);
    }

    // Combine all filters with `&&`
    const typesenseFilters = filtersList.length > 0 ? filtersList.join(" && ") : "";

    console.log(`Typesense filters: ${typesenseFilters}`);
    return typesenseFilters;
}

const sortByFilters: { [key: string]: string } = {
    // "alphabetical": "title:asc",
    // "highest-rated": "avgRating:desc",
    // "most-reviewed": "moneyDeployed:desc",
}

const getUpdatedSearchResults = async (
    state: any,
    isNewSearch: boolean = true
): Promise<{results: any[], total: number, totalPages: number}> => {
    try {
        // const TAG_PRIORITY_SORT = "_eval([ (tags:=[`Experienced in rare disease`]):2, (tags:=[`PAG friendly`]):1 ]):desc,avgRating:desc";

        const filtersString = generateFiltersString(state.filters)

        console.log(`FILTERS STRING`, filtersString)

        // Merge tag-priority sort with user-chosen sort
        // let sortBy = TAG_PRIORITY_SORT;
        // if (state.sortBy && sortByFilters[state.sortBy]) {
        //     sortBy += `,${sortByFilters[state.sortBy]}`;
        // }

        const searchParameters = {
            q: state.searchTerm,
            query_by: "description,gene,types,conditions",
            per_page: state.resultsPerPage,
            page: state.page,
            ...(filtersString ? { filter_by: filtersString } : undefined),
            // sort_by: sortBy,
        };

        const results = await typesense
            .collections("biosamples")
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

        const prismaResponse = await fetch('/api/biosamples', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        console.log(`prisma response...`, prismaResponse)

        if (!prismaResponse.ok) {
            const text = await prismaResponse.text() // may be empty or HTML on 405
            throw new Error(`POST /api/biosamples failed: ${prismaResponse.status} ${text}`)
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

type SetRecommendationsOptions = {
    limit?: number,
    priority?: string // milestone id
}

export interface BiosampleSearchState {
    initialized: boolean,
    initState: (filters: FiltersType) => void,
    searchTerm: string,
    setSearchTerm: (newSearch: string) => void,
    sortBy: string,
    setSortBy: (sortBy: string | undefined) => void,
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

export const useBiosampleSearchStore = create<BiosampleSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: (filters: FiltersType) => {
                set({ initialized: true, recommendations: [], filters })
            },
            searchTerm: '',
            setSearchTerm: async (newSearch: string) => {
                const { results, total, totalPages } = await getUpdatedSearchResults({
                    ...get(),
                    searchTerm: newSearch,
                    lastFetchedPage: 1,
                }, true)

                if (newSearch.length > 0) {
                    // only track searches if the user has entered text in the searchbar
                    const filters = get().filters
                    mixpanelTrack("Search Biosamples", {
                        "Search Term": newSearch,
                        "Results": total,
                        "Filters": {
                            "Types": filters.types?.map(filter => filter.label),
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
            sortBy: "alphabetical",
            setSortBy: async (sortBy: string | undefined) => {
                const { results, total, totalPages } = await getUpdatedSearchResults({
                    ...get(),
                    sortBy,
                    lastFetchedPage: 1,
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
                    page: 1,
                }, true)

                const recentlySelected = {
                    // categories: getExclusiveToFirstGroup(newFilters, get().filters, 'categories'),
                    types: getExclusiveToFirstGroup(newFilters, get().filters, 'types'),
                    // types: getExclusiveToFirstGroup(newFilters, get().filters, 'types'),
                    // certifications: getExclusiveToFirstGroup(newFilters, get().filters, 'certifications'),
                    // tags: getExclusiveToFirstGroup(newFilters, get().filters, 'tags')
                }

                const recentlyRemoved = {
                    // categories: getExclusiveToFirstGroup(get().filters, newFilters, 'categories'),
                    types: getExclusiveToFirstGroup(get().filters, newFilters, 'types'),
                    // types: getExclusiveToFirstGroup(get().filters, newFilters, 'types'),
                    // certifications: getExclusiveToFirstGroup(get().filters, newFilters, 'certifications'),
                    // tags: getExclusiveToFirstGroup(get().filters, newFilters, 'tags')
                }

                if (Object.values(recentlySelected).flatMap(value => value).length > 0 || Object.values(recentlyRemoved).flatMap(value => value).length > 0) {
                    // if something has been added or removed, track as a mixpanel event
                    mixpanelTrack("Marketplace Biosamples Filters Selected", {
                        "Results": total,
                        "Filters": {
                            "Types": newFilters.types.map(filter => filter.label),
                            // "Business Types": newFilters.types.map(filter => filter.label),
                            // "Certifications": newFilters.certifications.map(filter => filter.label),
                            // "Tags": newFilters.tags.map(filter => filter.label),
                            // "Categories": newFilters.categories.map(filter => filter.label)
                        },
                        "Added": {
                            "Types": recentlySelected.types.map(filter => filter.label),
                            // "Business Types": recentlySelected.types.map(filter => filter.label),
                            // "Certifications": recentlySelected.certifications.map(filter => filter.label),
                            // "Categories": recentlySelected.categories.map(filter => filter.label),
                            // "Tags": recentlySelected.tags.map(filter => filter.label)
                        },
                        "Removed": {
                            "Types": recentlyRemoved.types.map(filter => filter.label),
                            // "Business Types": recentlyRemoved.types.map(filter => filter.label),
                            // "Certifications": recentlyRemoved.certifications.map(filter => filter.label),
                            // "Categories": recentlyRemoved.categories.map(filter => filter.label),
                            // "Tags": recentlyRemoved.tags.map(filter => filter.label)
                        },
                    })
                }

                set({
                    filters: newFilters,
                    page: 1,
                    searchResults: results,
                    totalResults: total,
                    totalPages,
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
