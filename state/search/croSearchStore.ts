import { typesense } from '@comend/lib/typesense';
import { nanoid } from 'nanoid';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { ASSOCIATED_CATEGORIES, Milestone } from '@comend/lib/types'
import { getExclusiveToFirstGroup } from '@comend/lib/utils';
import { mixpanelTrack } from "@comend/lib/mixpanel";


export type ViewType = 'grid' | 'list'

export type FiltersType = {
    categories: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    milestoneTypes: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    types: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    certifications: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    tags: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    // moneyDeployed: number[],
    // genes: {
    //     label: string,
    //     value: string,
    //     disable?: boolean,
    // }[]
}

export const defaultFilters = {
    categories: [],
    milestoneTypes: [],
    types: [],
    certifications: [],
    tags: [],
    // moneyDeployed: [0, 10000000],
    // genes: []
}

function generateFiltersString(filters: FiltersType): string {
    let filtersList: string[] = [];

    const escapeValue = (value: string) => `\`${value}\``;

    // Categories (Array Field)
    if (filters?.categories && filters.categories.length > 0) {
        const categoryFilter = filters.categories
            .map(category => `categories:=[${escapeValue(category.value)}]`)
            .join(" && ");
        filtersList.push(`(${categoryFilter})`);
    }

    // Milestone Types (Array Field)
    if (filters?.milestoneTypes && filters.milestoneTypes.length > 0) {
        const milestoneTypeFilter = filters.milestoneTypes
            .map(milestoneType => `milestoneTypes:=[${escapeValue(milestoneType.value)}]`)
            .join(" && ");
        filtersList.push(`(${milestoneTypeFilter})`);
    }

    // Company Types (Single String Field)
    if (filters?.types && filters.types.length > 0) {
        const typeFilter = filters.types
            .map(type => `companyType:=${escapeValue(type.value)}`)
            .join(" || ");
        filtersList.push(`(${typeFilter})`);
    }

    // Certifications (Array Field)
    if (filters?.certifications && filters.certifications.length > 0) {
        const certificationFilter = filters.certifications
            .map(cert => `simplifiedCertifications:=[${escapeValue(cert.value)}]`)
            .join(" && ");
        filtersList.push(`(${certificationFilter})`);
    }

    // Tags (Array Field)
    if (filters?.tags && filters.tags.length > 0) {
        const tagsFilter = filters.tags
            .map(tag => `tags:=[${escapeValue(tag.value)}]`)
            .join(" && ");
        filtersList.push(`(${tagsFilter})`);
    }

    // Combine all filters with `&&`
    const typesenseFilters = filtersList.length > 0 ? filtersList.join(" && ") : "";

    console.log(`Typesense filters: ${typesenseFilters}`);
    return typesenseFilters;
}

const sortByFilters: { [key: string]: string } = {
    "alphabetical": "title:asc",
    "highest-rated": "avgRating:desc",
    // "most-reviewed": "moneyDeployed:desc",
}

const getUpdatedSearchResults = async (
    state: any,
    isNewSearch: boolean = true
): Promise<{results: any[], total: number}> => {
    try {
        const TAG_PRIORITY_SORT = "_eval([ (tags:=[`Experienced in rare disease`]):2, (tags:=[`PAG friendly`]):1 ]):desc,avgRating:desc";

        const filtersString = generateFiltersString(state.filters)

        // Merge tag-priority sort with user-chosen sort
        let sortBy = TAG_PRIORITY_SORT;
        if (state.sortBy && sortByFilters[state.sortBy]) {
            sortBy += `,${sortByFilters[state.sortBy]}`;
        }

        const searchParameters = {
            q: state.searchTerm,
            query_by: "title,description",
            per_page: 10,
            page: state.lastFetchedPage,
            ...(filtersString ? { filter_by: filtersString } : undefined),
            sort_by: sortBy,
        };

        const results = await typesense
            .collections("companies")
            .documents()
            .search(searchParameters);

        // return isNewSearch ? results.hits : state.searchResults

        const typeSenseHits = results.hits || [];
        // @ts-ignore
        const ids = typeSenseHits.map(hit => hit.document.id);

        if (ids.length === 0) {
            // return isNewSearch ? [] : state.searchResults;
            return {
                results: isNewSearch ? [] : state.searchResults,
                total: results.found || 0
            }
        }

        const prismaResponse = await fetch('/api/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        if (!prismaResponse.ok) {
            const text = await prismaResponse.text() // may be empty or HTML on 405
            throw new Error(`POST /api/companies failed: ${prismaResponse.status} ${text}`)
        }

        const prismaResults = await prismaResponse.json();

        const enrichedResults = ids.map((id: string) => prismaResults.find((company: any) => company.id === id) || null).filter(Boolean);

        return {
            results: isNewSearch ? enrichedResults : [...state.searchResults, ...enrichedResults],
            total: results.found || 0,
        };

    } catch (error) {
        console.error("Search error:", error);
        return {
            results: [],
            total: 0
        };
    }
};

export interface CROSearchState {
    initialized: boolean,
    initState: (filters: FiltersType) => void,
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
    filters: FiltersType,
    setFilters: (updatedFilters: FiltersType) => void,
    totalResults: undefined | number,
    setTotalResults: (total: number) => void,
}

export const useCROSearchStore = create<CROSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: (filters: FiltersType) => {
                set({ initialized: true, filters })
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
                    mixpanelTrack("Search Service Providers", {
                        "Search Term": newSearch,
                        "Results": total,
                        "Filters": {
                            "Milestone Types": filters.milestoneTypes.map(filter => filter.label),
                            "Business Types": filters.types.map(filter => filter.label),
                            "Certifications": filters.certifications.map(filter => filter.label),
                            "Tags": filters.tags.map(filter => filter.label),
                            "Categories": filters.categories.map(filter => filter.label)
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
                    categories: getExclusiveToFirstGroup(newFilters, get().filters, 'categories'),
                    milestoneTypes: getExclusiveToFirstGroup(newFilters, get().filters, 'milestoneTypes'),
                    types: getExclusiveToFirstGroup(newFilters, get().filters, 'types'),
                    certifications: getExclusiveToFirstGroup(newFilters, get().filters, 'certifications'),
                    tags: getExclusiveToFirstGroup(newFilters, get().filters, 'tags')
                }

                const recentlyRemoved = {
                    categories: getExclusiveToFirstGroup(get().filters, newFilters, 'categories'),
                    milestoneTypes: getExclusiveToFirstGroup(get().filters, newFilters, 'milestoneTypes'),
                    types: getExclusiveToFirstGroup(get().filters, newFilters, 'types'),
                    certifications: getExclusiveToFirstGroup(get().filters, newFilters, 'certifications'),
                    tags: getExclusiveToFirstGroup(get().filters, newFilters, 'tags')
                }

                if (Object.values(recentlySelected).flatMap(value => value).length > 0 || Object.values(recentlyRemoved).flatMap(value => value).length > 0) {
                    // if something has been added or removed, track as a mixpanel event
                    mixpanelTrack("Marketplace Service Provider Filters Selected", {
                        "Results": total,
                        "Filters": {
                            "Milestone Types": newFilters.milestoneTypes.map(filter => filter.label),
                            "Business Types": newFilters.types.map(filter => filter.label),
                            "Certifications": newFilters.certifications.map(filter => filter.label),
                            "Tags": newFilters.tags.map(filter => filter.label),
                            "Categories": newFilters.categories.map(filter => filter.label)
                        },
                        "Added": {
                            "Milestone Types": recentlySelected.milestoneTypes.map(filter => filter.label),
                            "Business Types": recentlySelected.types.map(filter => filter.label),
                            "Certifications": recentlySelected.certifications.map(filter => filter.label),
                            "Categories": recentlySelected.categories.map(filter => filter.label),
                            "Tags": recentlySelected.tags.map(filter => filter.label)
                        },
                        "Removed": {
                            "Milestone Types": recentlyRemoved.milestoneTypes.map(filter => filter.label),
                            "Business Types": recentlyRemoved.types.map(filter => filter.label),
                            "Certifications": recentlyRemoved.certifications.map(filter => filter.label),
                            "Categories": recentlyRemoved.categories.map(filter => filter.label),
                            "Tags": recentlyRemoved.tags.map(filter => filter.label)
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
            totalResults: undefined,
            setTotalResults: (total: number) => set({ totalResults: total }),
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
    )
