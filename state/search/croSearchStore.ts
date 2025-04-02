import { typesense } from '@/lib/typesense';
import { nanoid } from 'nanoid';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { ASSOCIATED_CATEGORIES, Milestone } from '@/lib/types'

export const sampleCROs: any[] = [
    {
        content: {
            id: nanoid(),
            title: "Sample CRO 1",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            url: "comend.io",
            scientistDotComURL: null,
            yearEstablished: 2023,
            website: "https://comend.io/",
            headquarters: "Austin, Texas",
            companyType: "startup",
        },
        milestone: {
            nodeType: "RFP",
            title: "Sample Milestone 1"
        }
    },
    {
        content: {
            id: nanoid(),
            title: "Sample CRO 2",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            url: "comend.io",
            scientistDotComURL: null,
            yearEstablished: 2023,
            website: "https://comend.io/",
            headquarters: "Toronto, Ontario",
            companyType: "startup",
        },
        milestone: {
            nodeType: "PROJECT",
            title: "Sample Milestone 2"
        }
    }
]

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    categories: {
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
    // moneyDeployed: number[],
    // genes: {
    //     label: string,
    //     value: string,
    //     disable?: boolean,
    // }[]
}

export const defaultFilters = {
    categories: [],
    types: [],
    certifications: [],
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

    // Categories (Array Field)
    if (filters?.categories && filters.categories.length > 0) {
        const categoryFilter = filters.categories
            .map(category => `categories:=[${escapeValue(category.value)}]`)
            .join(" && ");
        filtersList.push(`(${categoryFilter})`);
    }

    // Company Types (Single String Field)
    if (filters?.types && filters.types.length > 0) {
        const typeFilter = filters.types
            .map(type => `companyType:=${escapeValue(type.value)}`)
            .join(" && ");
        filtersList.push(`(${typeFilter})`);
    }

    // Certifications (Array Field)
    if (filters?.certifications && filters.certifications.length > 0) {
        const certificationFilter = filters.certifications
            .map(cert => `simplifiedCertifications:=[${escapeValue(cert.value)}]`)
            .join(" && ");
        filtersList.push(`(${certificationFilter})`);
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
                certifications: []
            }
            const newSearchResults = await getUpdatedSearchResults({
                searchTerm: '',
                sortBy: undefined,
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

const getUpdatedSearchResults = async (state: any, isNewSearch: boolean = true) => {
    try {
        const filtersString = generateFiltersString(state.filters)

        const searchParameters = {
            q: state.searchTerm,
            query_by: "title",
            per_page: 10,
            page: state.lastFetchedPage,
            ...(filtersString ? { filter_by: filtersString } : undefined),
            ...(state.sortBy ? { sort_by: sortByFilters[state.sortBy] } : undefined),
        };
        console.log(searchParameters)

        const results = await typesense
            .collections("companies")
            .documents()
            .search(searchParameters);

        // return isNewSearch ? results.hits : state.searchResults

        const typeSenseHits = results.hits || [];
        // @ts-ignore
        const ids = typeSenseHits.map(hit => hit.document.id);

        if (ids.length === 0) {
            return isNewSearch ? [] : state.searchResults;
        }

        const prismaResponse = await fetch('/api/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        const prismaResults = await prismaResponse.json();

        const enrichedResults = ids.map(id => prismaResults.find((company: any) => company.id === id) || null).filter(Boolean);

        return isNewSearch ? enrichedResults : [...state.searchResults, ...enrichedResults];

    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
};

type SetRecommendationsOptions = {
    limit?: number,
    priority?: string // milestone id
}

export interface CROSearchState {
    initialized: boolean,
    initState: () => void,
    searchTerm: string,
    setSearchTerm: (newSearch: string) => void,
    sortBy: string | undefined,
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
    recommendations: Recommendation[] | undefined
    setRecommendations: (milestones: Milestone[], options?: SetRecommendationsOptions) => Promise<Recommendation[]>
}

export const useCROSearchStore = create<CROSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: () => {
                set({ initialized: true, recommendations: [] })
            },
            searchTerm: '',
            setSearchTerm: async (newSearch: string) => {
                console.log(`set search term`)
                const newSearchResults = await getUpdatedSearchResults({
                    ...get(),
                    searchTerm: newSearch,
                    lastFetchedPage: 1,
                }, true)
                set({ 
                    searchTerm: newSearch, 
                    searchResults: newSearchResults, 
                    lastFetchedPage: 1
                })
            },
            sortBy: undefined,
            setSortBy: async (sortBy: string | undefined) => {
                const newSearchResults = await getUpdatedSearchResults({
                    ...get(),
                    sortBy,
                    lastFetchedPage: 1,
                }, true)
                set({ sortBy, searchResults: newSearchResults, lastFetchedPage: 1 })
            },
            lastFetchedPage: 1, // page numbers in TypeSense start at 1
            setLastFetchedPage: async (page: number) => {
                const updateSearchResults = await getUpdatedSearchResults({ 
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
                const newSearchResults = await getUpdatedSearchResults({
                    ...get(),
                    filters: newFilters,
                    lastFetchedPage: 1,
                }, true)
                set({ 
                    filters: newFilters, 
                    lastFetchedPage: 1,
                    searchResults: newSearchResults
                })
            },
            recommendations: undefined,
            setRecommendations: async (milestones: Milestone[], options?: SetRecommendationsOptions) => {
                console.log(`get recommendations`, options)
                set({recommendations: undefined})
                const recommendationResults = await generateRecommendations(
                    options?.priority 
                        // ? milestones.sort(function(x,y){ return x == first ? -1 : y == first ? 1 : 0; })
                        ? milestones.sort((x, y) => x.id === options.priority ? -1 : y.id === options.priority ? 1 : 0)
                        : milestones
                )

                // remove duplicates before returning
                const prunedRecommendations = options?.limit
                    ? Array.from(new Set(recommendationResults)).slice(0, options.limit) 
                    : Array.from(new Set(recommendationResults))

                set({
                    recommendations: prunedRecommendations
                })
                return prunedRecommendations
            }
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
    )
