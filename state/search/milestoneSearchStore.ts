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
    if (filters.milestoneTypes.length > 0) {
        filters.milestoneTypes.forEach(type => {
            filtersList.push(`type:=${type.value}`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}type:=${type.value}`)
        })
    }

    if (filters.milestoneStatus.length > 0) {
        filters.milestoneStatus.forEach(status => {
            filtersList.push(`status:=${status}`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}status:=${status}`)
        })
    }

    if (filters.hasProject) {
        filtersList.push(`RFPId_exists:=true`)
        typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}RFPId_exists:=true`)
    }

    if (filters.hasAsset) {
        filtersList.push(`assetId_exists:=true`)
        typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}assetId_exists:=true`)
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
    console.log(`filters list`, filtersList)
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

        const typeSenseHits = results.hits || [];
        // @ts-ignore
        const ids = typeSenseHits.map(hit => hit.document.id);

        if (ids.length === 0) {
            return isNewSearch ? [] : state.searchResults;
        }

        const prismaResponse = await fetch('/api/milestones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        const prismaResults = await prismaResponse.json();

        console.log(prismaResults)
        const enrichedResults = ids.map(id => prismaResults.find((org: any) => org.id === id) || null).filter(Boolean);

        return isNewSearch ? enrichedResults : [...state.searchResults, ...enrichedResults];

    } catch (error) {
        console.error("Search error:", error)
        return []
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