import { typesense } from '@/lib/typesense';
import { temporal } from 'zundo';
import { create } from 'zustand';

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    milestoneTypes: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    milestoneStatus: string[],
    hasProject: boolean,
    hasAsset: boolean
}

export const defaultFilters = {
    milestoneTypes: [],
    milestoneStatus: [],
    hasProject: false,
    hasAsset: false
}

function generateFiltersString(filters: FiltersType) {
    let filtersList: string[] = []
    let typesenseFilters = ""

    console.log(`form filters`, filtersList)

    // addative filters
    // if (filters.mechanisms.length > 0) {
    //     filters.mechanisms.forEach(mechanism => {
    //         filtersList.push(`diseaseMechanisms:=[${mechanism.value}]`)
    //         typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}diseaseMechanisms:=[${mechanism.value}]`)
    //     })
    // }

    if (filters.milestoneTypes.length > 0) {
        filters.milestoneTypes.forEach(type => {
            filtersList.push(`type:=${type.value}`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}type:=${type.value}`)
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
    "alphabetical": "title:asc",
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
            .collections("milestones")
            .documents()
            .search(searchParameters);

        console.log(`search results`, results.hits)
        if (isNewSearch) return [...(results.hits || [])]           // new search - don't keep previous results
        return [...state.searchResults, ...(results.hits || [])]    // update search - keep previous results

    } catch (error) {
        console.error("Search error:", error);
    }
}

export interface MilestoneSearchState {
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
    setFilters: (updatedFilters: FiltersType) => void
}

export const useMilestoneSearchStore = create<MilestoneSearchState>()(
    temporal((set, get) => ({
        searchTerm: '',
        setSearchTerm: async (newSearch: string) => {
            const newSearchResults = await getUpdatedSearchResults({
                ...get(),
                searchTerm: newSearch,
                lastFetchedPage: 1,
            }, true)
            set({ searchTerm: newSearch, searchResults: newSearchResults, lastFetchedPage: 1 })
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
        }
    }),
    {
        limit: 100, // limit the stored history states to 100
    })
)