import { typesense } from '@comend/lib/typesense';
import { nanoid } from 'nanoid';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { ASSOCIATED_CATEGORIES, Milestone } from '@comend/lib/types'
import { getExclusiveToFirstGroup } from '@comend/lib/utils';
import { mixpanelTrack } from "@comend/lib/mixpanel";


export type ViewType = 'grid' | 'list'

export type FiltersType = {
    // categories: {
    //     label: string,
    //     value: string,
    //     disable?: boolean,
    // }[],
    types: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    // types: {
    //     label: string,
    //     value: string,
    //     disable?: boolean,
    // }[],
    // certifications: {
    //     label: string,
    //     value: string,
    //     disable?: boolean,
    // }[],
    // tags: {
    //     label: string,
    //     value: string,
    //     disable?: boolean,
    // }[],
    // moneyDeployed: number[],
    // genes: {
    //     label: string,
    //     value: string,
    //     disable?: boolean,
    // }[]
}

export const defaultFilters = {
    // categories: [],
    types: [],
    // types: [],
    // certifications: [],
    // tags: [],
    // moneyDeployed: [0, 10000000],
    // genes: []
}

export type Recommendation = {
    content: any
    milestone: Milestone
}

function generateFiltersString(filters: FiltersType): string {
    let filtersList: string[] = [];

    const escapeValue = (value: string) => `\`${value}\``;

    // // Categories (Array Field)
    // if (filters?.categories && filters.categories.length > 0) {
    //     const categoryFilter = filters.categories
    //         .map(category => `categories:=[${escapeValue(category.value)}]`)
    //         .join(" && ");
    //     filtersList.push(`(${categoryFilter})`);
    // }

    // Disease Model Types (Array Field)
    if (filters?.types && filters.types.length > 0) {
        const typeFilter = filters.types
            .map(type => `types:=[${escapeValue(type.value)}]`)
            .join(" || ");
        filtersList.push(`(${typeFilter})`);
    }

    // // Company Types (Single String Field)
    // if (filters?.types && filters.types.length > 0) {
    //     const typeFilter = filters.types
    //         .map(type => `companyType:=${escapeValue(type.value)}`)
    //         .join(" || ");
    //     filtersList.push(`(${typeFilter})`);
    // }

    // // Certifications (Array Field)
    // if (filters?.certifications && filters.certifications.length > 0) {
    //     const certificationFilter = filters.certifications
    //         .map(cert => `simplifiedCertifications:=[${escapeValue(cert.value)}]`)
    //         .join(" && ");
    //     filtersList.push(`(${certificationFilter})`);
    // }

    // // Tags (Array Field)
    // if (filters?.tags && filters.tags.length > 0) {
    //     const tagsFilter = filters.tags
    //         .map(tag => `tags:=[${escapeValue(tag.value)}]`)
    //         .join(" && ");
    //     filtersList.push(`(${tagsFilter})`);
    // }

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

const generateRecommendations = async (milestones: Milestone[]) => {
    let recommendationResults: Recommendation[] = []

    await Promise.all(
        milestones.map(async (milestone) => {
            const newFilters = {
                categories: Array.from(
                    new Set((milestone?.types || []).flatMap(type => type?.milestoneType?.categories || []))
                )
                    .map(categoryValue => (ASSOCIATED_CATEGORIES.find(c => c.value === categoryValue)))
                    .filter(c => c !== undefined)
                    .map(c => ({label: c?.label, value: c?.value})),
                types: [],
                certifications: [],
                tags: []
            }
            const {results: newSearchResults} = await getUpdatedSearchResults({
                searchTerm: '',
                sortBy: "alphabetical",
                filters: newFilters,
                lastFetchedPage: 1,
            }, true)

            recommendationResults = recommendationResults.concat(newSearchResults.map((result: any) => {
                return ({
                    content: result,
                    milestone
                } as Recommendation)
            }))
        })
    )

    return recommendationResults
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
            query_by: "gene",
            per_page: state.resultsPerPage,
            page: state.page,
            ...(filtersString ? { filter_by: filtersString } : undefined),
            // sort_by: sortBy,
        };

        const results = await typesense
            .collections("disease-models")
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

        const prismaResponse = await fetch('/api/disease-models', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        console.log(`prisma response...`, prismaResponse)

        if (!prismaResponse.ok) {
            const text = await prismaResponse.text() // may be empty or HTML on 405
            throw new Error(`POST /api/disease-models failed: ${prismaResponse.status} ${text}`)
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

export interface DiseaseModelSearchState {
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
    lastFetchedPage: number,
    setLastFetchedPage: (page: number) => void,
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

export const useDiseaseModelSearchStore = create<DiseaseModelSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: (filters: FiltersType) => {
                set({ initialized: true, recommendations: [], filters })
            },
            searchTerm: '',
            setSearchTerm: async (newSearch: string) => {
                const { results, total } = await getUpdatedSearchResults({
                    ...get(),
                    searchTerm: newSearch,
                    lastFetchedPage: 1,
                }, true)

                if (newSearch.length > 0) {
                    // only track searches if the user has entered text in the searchbar
                    const filters = get().filters
                    mixpanelTrack("Search Disease Models", {
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
                    lastFetchedPage: 1,
                    totalResults: total,
                })
            },
            sortBy: "alphabetical",
            setSortBy: async (sortBy: string | undefined) => {
                const { results, total } = await getUpdatedSearchResults({
                    ...get(),
                    sortBy,
                    lastFetchedPage: 1,
                }, true)
                set({ sortBy, searchResults: results, lastFetchedPage: 1, totalResults: total })
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
            lastFetchedPage: 1, // page numbers in TypeSense start at 1
            setLastFetchedPage: async (page: number) => {
                const {results: updateSearchResults} = await getUpdatedSearchResults({
                    ...get(),
                    lastFetchedPage: page
                }, false)
                set({ lastFetchedPage: page, searchResults: updateSearchResults })
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
                const { results, total } = await getUpdatedSearchResults({
                    ...get(),
                    filters: newFilters,
                    lastFetchedPage: 1,
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
                    mixpanelTrack("Marketplace Disease Models Filters Selected", {
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
                    lastFetchedPage: 1,
                    searchResults: results,
                    totalResults: total,
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
