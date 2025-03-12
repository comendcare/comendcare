import { typesense } from '@/lib/typesense';
import { Milestone } from '@prisma/client';
import { nanoid } from 'nanoid';
import { temporal } from 'zundo';
import { create } from 'zustand';

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

function generateFiltersString(filters: FiltersType): string {
    let filtersList: string[] = [];

    // Categories (Array Field)
    if (filters.categories.length > 0) {
        const categoryFilter = filters.categories
            .map(category => `categories:=["${category.value}"]`)
            .join(" && ");
        filtersList.push(`(${categoryFilter})`);
    }

    // Company Types (Single String Field)
    if (filters.types.length > 0) {
        const typeFilter = filters.types
            .map(type => `companyType:="${type.value}"`) // Ensure quotes around value
            .join(" && ");
        filtersList.push(`(${typeFilter})`);
    }

    // Certifications (Array Field)
    if (filters.certifications.length > 0) {
        const certificationFilter = filters.certifications
            .map(cert => `simplifiedCertifications:=["${cert.value}"]`)
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

const getUpdatedSearchResults = async (state: any, isNewSearch: boolean = true) => {
    try {
        const searchParameters = {
            q: state.searchTerm,
            query_by: "title",
            per_page: 10,
            page: state.lastFetchedPage,
            ...(generateFiltersString(state.filters) ? { filter_by: generateFiltersString(state.filters) } : undefined),
            ...(state.sortBy ? { sort_by: sortByFilters[state.sortBy] } : undefined),
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

export type Recommendation = {
    content: any
    milestone: Milestone
}

export interface CROSearchState {
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
    recommendations: Recommendation[] | undefined
    setRecommendations: (results: any[]) => void
    filters: FiltersType,
    setFilters: (updatedFilters: FiltersType) => void
}

export const useCROSearchStore = create<CROSearchState>()(
    temporal((set, get) => ({
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
                    lastFetchedPage: 1,
                    // TEMPORARY SOLUTION HERE: to add something to the recommendations section, remove setting recommendations here when fully implementing recommendations
                    recommendations: newSearchResults.slice(0, 6).map((result: any) => ({
                        content: result,
                        milestone: {
                            title: "Sample milestone",
                            nodeType: "PROJECT"
                        }
                    })) 
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
            // recommendations: undefined,
            // TEMPORARY SOLUTION HERE: just setting this so we can get something in the milestone recommendations
            recommendations: sampleCROs,
            setRecommendations: (results: any[]) => set({ recommendations: results }),
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
            }
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
    )
