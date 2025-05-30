import {typesense} from '@/lib/typesense';
import {temporal} from 'zundo';
import {create} from 'zustand';

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    milestoneTypes: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    milestoneStatus: string[],
    nodeType: string[],
    // hasProject: boolean,
    // hasAsset: boolean
}

export const defaultFilters = {
    milestoneTypes: [],
    milestoneStatus: [],
    nodeType: []
    // hasProject: false,
    // hasAsset: false
}

function generateFiltersString(filters: FiltersType, strategy: "add" | "sub") {
    let filtersList: string[] = []
    let typesenseFilters = ""
    const strategyString = strategy === "add" ? "||" : "&&"

    console.log(`form filters`, filtersList)

    // addative filters
    // if (filters.milestoneTypes.length > 0) {
    //     filters.milestoneTypes.forEach(type => {
    //         filtersList.push(`types:=${type.value}`)
    //         typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? strategyString : '('}types:=${type.value}`)
    //     })
    // }

    if (filters.milestoneTypes.length > 0) {
        filters.milestoneTypes.forEach(type => {
            filtersList.push(`types:=[${type}]`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? '||' : '('}types:=[${type}]`)
        })
    }

    if (filters.milestoneStatus.length > 0) {
        filters.milestoneStatus.forEach(status => {
            filtersList.push(`status:=${status}`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? strategyString : '('}status:=${status}`)
        })
    }

    if (filters.nodeType.length > 0) {
        filters.nodeType.forEach(type => {
            filtersList.push(`nodeType:=${type}`)
            typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? strategyString : '('}nodeType:=${type}`)
        })
    }

    // if (filters.hasProject) {
    //     filtersList.push(`RFPId_exists:=true`)
    //     typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? strategyString : '('}RFPId_exists:=true`)
    // }

    // if (filters.hasAsset) {
    //     filtersList.push(`toolId_exists:=true`)
    //     typesenseFilters = typesenseFilters.concat(`${typesenseFilters.length > 0 ? strategyString : '('}toolId_exists:=true`)
    // }

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
    "last-updated-old-new": "updatedAt:asc",
    "last-updated-new-old": "updatedAt:desc",
}

const getUpdatedSearchResults = async (state: any, isNewSearch: boolean = true, filterStrategy: "add" | "sub") => {
    try {
        const searchParameters = {
            q: state.searchTerm,
            query_by: "title",
            per_page: 10,
            page: state.lastFetchedPage,
            ...(generateFiltersString(state.filters, filterStrategy) ? { filter_by: generateFiltersString(state.filters, filterStrategy) } : undefined),
            ...(state.sortBy ? { sort_by: sortByFilters[state.sortBy] } : undefined),
        };

        const results = await typesense
            .collections("milestones")
            .documents()
            .search(searchParameters);

        const typeSenseHits = results.hits || [];
        console.log(`typesense hits`, typeSenseHits)
        // @ts-ignore
        const ids = typeSenseHits.map(hit => hit.document.id);

        if (ids.length === 0) {
            return isNewSearch ? [] : (filterStrategy === "add" ? state.searchResultsAdd : state.searchResultsSub);
        }

        const prismaResponse = await fetch('/api/milestones', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ids}),
        });

        const prismaResults = await prismaResponse.json();

        const enrichedResults = ids.map(id => prismaResults.find((org: any) => org.id === id) || null).filter(Boolean).filter(milestone => !milestone.private);

        return isNewSearch ? enrichedResults : [
            ...(filterStrategy === "add" ? state.searchResultsAdd : state.searchResultsSub),
            ...enrichedResults
        ];

    } catch (error) {
        console.error("Search error:", error)
        return []
    }
}

export interface MilestoneSearchState {
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
    searchResultsAdd: any[] | undefined
    searchResultsSub: any[] | undefined
    setSearchResults: (resultsAdd: any[], resultsSub: any[]) => void
    filters: FiltersType,
    setFilters: (updatedFilters: FiltersType) => void
}

export const useMilestoneSearchStore = create<MilestoneSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: () => {
                set({ initialized: true })
            },
            searchTerm: '',
            setSearchTerm: async (newSearch: string) => {
                const newSearchResultsAdd = await getUpdatedSearchResults({
                    ...get(), searchTerm: newSearch, lastFetchedPage: 1
                }, true, "add");

                const newSearchResultsSub = await getUpdatedSearchResults({
                    ...get(), searchTerm: newSearch, lastFetchedPage: 1
                }, true, "sub");

                set({
                    searchTerm: newSearch,
                    searchResultsAdd: newSearchResultsAdd,
                    searchResultsSub: newSearchResultsSub,
                    lastFetchedPage: 1
                });
            },
            sortBy: undefined,
            setSortBy: async (sortBy: string | undefined) => {
                const newSearchResultsAdd = await getUpdatedSearchResults({
                    ...get(),
                    sortBy,
                    lastFetchedPage: 1,
                }, true, "add");

                const newSearchResultsSub = await getUpdatedSearchResults({
                    ...get(),
                    sortBy,
                    lastFetchedPage: 1,
                }, true, "sub");

                set({ sortBy, searchResultsAdd: newSearchResultsAdd, searchResultsSub: newSearchResultsSub, lastFetchedPage: 1 });
            },
            lastFetchedPage: 1, // page numbers in TypeSense start at 1
            setLastFetchedPage: async (page: number) => {
                const newSearchResultsAdd = await getUpdatedSearchResults({
                    ...get(),
                    lastFetchedPage: page
                }, false, "add");

                const newSearchResultsSub = await getUpdatedSearchResults({
                    ...get(),
                    lastFetchedPage: page
                }, false, "sub");

                set({ lastFetchedPage: page, searchResultsAdd: newSearchResultsAdd, searchResultsSub: newSearchResultsSub });
            },
            view: 'grid',
            setView: (view: ViewType) => set({view}),
            allResults: [],
            setAllResults: (results: any[]) => set({allResults: results}),
            searchResultsAdd: undefined,
            searchResultsSub: undefined,
            setSearchResults: (resultsAdd: any[], resultsSub: any[]) => set({ searchResultsAdd: resultsAdd, searchResultsSub: resultsSub }),
            filters: defaultFilters,
            setFilters: async (updatedFilters: FiltersType) => {
                const newFilters = { ...get().filters, ...updatedFilters };

                const newSearchResultsAdd = await getUpdatedSearchResults({
                    ...get(),
                    filters: newFilters,
                    lastFetchedPage: 1,
                }, true, "add");

                const newSearchResultsSub = await getUpdatedSearchResults({
                    ...get(),
                    filters: newFilters,
                    lastFetchedPage: 1,
                }, true, "sub");

                set({
                    filters: newFilters,
                    lastFetchedPage: 1,
                    searchResultsAdd: newSearchResultsAdd,
                    searchResultsSub: newSearchResultsSub
                });
            }
    }),
        {
            limit: 100, // limit the stored history states to 100
        })
)
