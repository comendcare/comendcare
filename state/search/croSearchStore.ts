import { typesense } from '@/lib/typesense';
import { Milestone } from '@prisma/client';
import { temporal } from 'zundo';
import { create } from 'zustand';

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    mechanisms: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    systems: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    modalities: {
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
    mechanisms: [],
    systems: [],
    modalities: [],
    // moneyDeployed: [0, 10000000],
    // genes: []
}

function generateFiltersString(filters: FiltersType) {
    let filtersList: string[] = []
    let typesenseFilters = ""

    // addative filters
    if (filters.systems.length > 0) {
        filters.systems.forEach(system => {
            filtersList.push(`condition.condition.associatedSystems:=[${system.value}]`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}condition.condition.associatedSystems:=[${system.value}]`)
        })
    }

    if (filters.mechanisms.length > 0) {
        filters.mechanisms.forEach(mechanism => {
            filtersList.push(`condition.condition.relevantDiseaseMechanisms:=[${mechanism.value}]`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}condition.condition.relevantDiseaseMechanisms:=[${mechanism.value}]`)
        })
    }

    if (filters.modalities.length > 0) {
        filters.modalities.forEach(modality => {
            filtersList.push(`condition.condition.interestedModalities:=[${modality.value}]`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}condition.condition.interestedModalities:=[${modality.value}]`)
        })
    }

    if (typesenseFilters.length > 0) typesenseFilters = typesenseFilters.concat(")")

    // subtractive filters
    // if (filters.moneyDeployed) {
    //     filtersList.push(`moneyDeployed:>=${filters.moneyDeployed[0]}`)
    //     filtersList.push(`moneyDeployed:<${filters.moneyDeployed[1]}`)
    //     typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '&&' : ''}moneyDeployed:>=${filters.moneyDeployed[0]}`)
    //     typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '&&' : ''}moneyDeployed:<${filters.moneyDeployed[1]}`)
    // }

    console.log(`typesense filters: `, typesenseFilters)
    return typesenseFilters
}

const sortByFilters: { [key: string]: string } = {
    "alphabetical": "name:asc",
    // "patients-low-high": "condition.numberOfIdentifiedPatients:asc",
    // "patients-high-low": "condition.numberOfIdentifiedPatients:desc",
    // "prevalence-low-high": "prevalenceRatio:asc",
    // "prevalence-high-low": "prevalenceRatio:desc",
    // "money-raised-low-high": "moneyRaised:asc",
    // "money-raised-high-low": "moneyRaised:desc",
    "money-deployed-low-high": "moneyDeployed:asc",
    "money-deployed-high-low": "moneyDeployed:desc",
    "patients-engaged-low-high": "firstConditionPatientsEngaged:asc",
    "patients-engaged-high-low": "firstConditionPatientsEngaged:desc"
}

const getUpdatedSearchResults = async (state: any, isNewSearch: boolean = true) => {
    try {
        const searchParameters = {
            q: state.searchTerm,
            query_by: "title",
            per_page: 10,
            page: state.lastFetchedPage,
            // ...(generateFiltersString(state.filters) ? { filter_by: generateFiltersString(state.filters) } : undefined),
            // ...(state.sortBy ? { sort_by: sortByFilters[state.sortBy] } : undefined),
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
            recommendations: undefined,
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
