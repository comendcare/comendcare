import {mechanisms} from "@comend/lib/types";
import {typesense} from '@comend/lib/typesense';
import {temporal} from 'zundo';
import {create} from 'zustand';
import { getExclusiveToFirstGroup } from '@comend/lib/utils';
import { mixpanelTrack } from "@comend/lib/mixpanel";
import { isEqual } from 'lodash';

export type ViewType = 'grid' | 'list'

export type FiltersType = {
    researchInterests: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    therapeuticsOfInterest: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    conditionsOfInterest: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    genes: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
}

export const defaultFilters: FiltersType = {
    researchInterests: [],
    therapeuticsOfInterest: [],
    conditionsOfInterest: [],
    genes: [],
}

function generateFiltersString(filters: FiltersType) {
    let filtersList: string[] = []

    const escapeValue = (value: string) => `\`${value}\``;

    if (filters?.researchInterests && filters.researchInterests.length > 0) {
        const researchInterestsFilter = filters.researchInterests
            .map(interest => `researchInterests:=${escapeValue(interest.label)}`)
            .join(" || ");
        filtersList.push(`(${researchInterestsFilter})`);
    }

    if (filters?.therapeuticsOfInterest && filters.therapeuticsOfInterest.length > 0) {
        const therapeuticInterestsFilter = filters.therapeuticsOfInterest
            .map(interest => `therapeuticsOfInterest:=${escapeValue(interest.label)}`)
            .join(" || ");
        filtersList.push(`(${therapeuticInterestsFilter})`);
    }

    if (filters?.conditionsOfInterest && filters.conditionsOfInterest.length > 0) {
        const conditionInterestsFilter = filters.conditionsOfInterest
            .map(interest => `conditionsOfInterest:=${escapeValue(interest.label)}`)
            .join(" || ");
        filtersList.push(`(${conditionInterestsFilter})`);
    }

    if (filters?.genes && filters.genes.length > 0) {
        const geneFilter = filters.genes
            .map(gene => `genesOfInterest:=${escapeValue(gene.value)}`)
            .join(" || ");
        filtersList.push(`(${geneFilter})`);
    }

    const typesenseFilters = filtersList.length > 0 ? filtersList.join(" && ") : "";

    console.log(`typesense filters: `, typesenseFilters)
    return typesenseFilters
}

const sortByFilters: { [key: string]: string } = {
    "recently-updated": "updatedAt:desc",
    "alphabetical": "name:asc",
}

const getUpdatedSearchResults = async (state: any, isNewSearch: boolean = true): Promise<{results: any[], total: number}> => {
    try {
        const TAG_PRIORITY_SORT = "";

        const filtersString = generateFiltersString(state.filters)

        // Merge tag-priority sort with user-chosen sort
        let sortBy = TAG_PRIORITY_SORT;
        if (state.sortBy && sortByFilters[state.sortBy]) {
            sortBy += `,${sortByFilters[state.sortBy]}`;
        }

        const searchParameters = {
            q: state.searchTerm,
            query_by: "name,description,researchInterests,therapeuticsOfInterest,conditionsOfInterest,genesOfInterest,affiliations.institution.name",
            per_page: 12,
            page: state.lastFetchedPage,
            ...(filtersString ? { filter_by: filtersString } : undefined),
            ...(state.sortBy ? {sort_by: sortByFilters[state.sortBy]} : undefined),
        };

        const results = await typesense
            .collections("researchers")
            .documents()
            .search(searchParameters);

        // return isNewSearch ? results.hits : state.searchResults

        const typeSenseHits = results.hits || [];
        // @ts-ignore
        const ids = typeSenseHits.map(hit => hit.document.id);

        if (ids.length === 0) {
            return {
                results: isNewSearch ? [] : state.searchResults,
                total: results.found || 0
            }
        }

        const prismaResponse = await fetch('/api/researchers', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ids}),
        });

        if (!prismaResponse.ok) {
            const text = await prismaResponse.text() // may be empty or HTML on 405
            throw new Error(`POST /api/researchers failed: ${prismaResponse.status} ${text}`)
        }

        const prismaResults = await prismaResponse.json();

        const enrichedResults = ids.map((id: string) => prismaResults.find((researcher: any) => researcher.id === id) || null).filter(Boolean);

        return {
            results: isNewSearch ? enrichedResults : [...state.searchResults, ...enrichedResults],
            total: results.found || 0,
        };

    } catch (error) {
        console.error("Search error:", error);
        return {
            results: [],
            total: 0
        }
    }
};

export interface ResearcherSearchState {
    initialized: boolean,
    initState: (filters: FiltersType) => Promise<void>,
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

export const useResearcherSearchStore = create<ResearcherSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: async (filters: FiltersType) => {
                set({
                    searchTerm: "",
                    sortBy: "alphabetical",
                    lastFetchedPage: 1,
                    filters,
                })

                const {results: newSearchResults, total} = await getUpdatedSearchResults({
                    ...get(),
                    searchTerm: "",
                    lastFetchedPage: 1,
                }, true)

                set({
                    searchTerm: "",
                    searchResults: newSearchResults,
                    lastFetchedPage: 1,
                    totalResults: total,
                    initialized: true,
                })
            },
            searchTerm: '',
            setSearchTerm: async (newSearch: string) => {
                const {results: newSearchResults, total} = await getUpdatedSearchResults({
                    ...get(),
                    searchTerm: newSearch,
                    lastFetchedPage: 1,
                }, true)

                if (newSearch.length > 0) {
                    // only track searches if the user has entered text in the searchbar
                    const filters = get().filters
                    // mixpanelTrack("Search Researchers", {
                    //     "Search Term": newSearch,
                    //     "Results": total,
                    //     "Filters": {
                    //         "Mechanisms of Action": filters.mechanisms.map(filter => filter.label),
                    //         "Associated Systems": filters.systems.map(filter => filter.label),
                    //         "Modalities of Interest": filters.modalities.map(filter => filter.label)
                    //     }
                    // })
                }

                set({
                    searchTerm: newSearch,
                    searchResults: newSearchResults,
                    lastFetchedPage: 1,
                    totalResults: total,
                })
            },
            sortBy: "alphabetical",
            setSortBy: async (sortBy: string | undefined) => {
                const {results: newSearchResults, total} = await getUpdatedSearchResults({
                    ...get(),
                    sortBy,
                    lastFetchedPage: 1,
                }, true)
                set({sortBy, searchResults: newSearchResults, lastFetchedPage: 1, totalResults: total})
            },
            lastFetchedPage: 1, // page numbers in TypeSense start at 1
            setLastFetchedPage: async (page: number) => {
                const {results: updateSearchResults} = await getUpdatedSearchResults({
                    ...get(),
                    lastFetchedPage: page
                }, false)
                set({lastFetchedPage: page, searchResults: updateSearchResults})
            },
            view: 'grid',
            setView: (view: ViewType) => set({view}),
            allResults: [],
            setAllResults: (results: any[]) => set({allResults: results}),
            searchResults: undefined,
            setSearchResults: (results: any[]) => set({searchResults: results}),
            filters: defaultFilters,
            setFilters: async (updatedFilters: FiltersType) => {
                const newFilters = {
                    ...get().filters,
                    ...updatedFilters
                }

                const {results: newSearchResults, total} = await getUpdatedSearchResults({
                    ...get(),
                    filters: newFilters,
                    lastFetchedPage: 1,
                }, true)

                // const recentlySelected = {
                //     mechanisms: getExclusiveToFirstGroup(newFilters, get().filters, 'mechanisms'),
                //     systems: getExclusiveToFirstGroup(newFilters, get().filters, 'systems'),
                //     modalities: getExclusiveToFirstGroup(newFilters, get().filters, 'modalities')
                // }

                // const recentlyRemoved = {
                //     mechanisms: getExclusiveToFirstGroup(get().filters, newFilters, 'mechanisms'),
                //     systems: getExclusiveToFirstGroup(get().filters, newFilters, 'systems'),
                //     modalities: getExclusiveToFirstGroup(get().filters, newFilters, 'modalities')
                // }

                // if (Object.values(recentlySelected).flatMap(value => value).length > 0 || Object.values(recentlyRemoved).flatMap(value => value).length > 0) {
                //     // only track in mixpanel if something in the filters has been updated
                //     mixpanelTrack("Marketplace Researchers Filters Selected", {
                //         "Results": total,
                //         "Filters": {
                //             "Mechanisms of Action": newFilters.mechanisms.map(filter => filter.label),
                //             "Associated Systems": newFilters.systems.map(filter => filter.label),
                //             "Modalities of Interest": newFilters.modalities.map(filter => filter.label)
                //         },
                //         "Added": {
                //             "Mechanisms of Action": recentlySelected.mechanisms.map(filter => filter.label),
                //             "Associated Systems": recentlySelected.systems.map(filter => filter.label),
                //             "Modalities of Interest": recentlySelected.modalities.map(filter => filter.label)
                //         },
                //         "Removed": {
                //             "Mechanisms of Action": recentlyRemoved.mechanisms.map(filter => filter.label),
                //             "Associated Systems": recentlyRemoved.systems.map(filter => filter.label),
                //             "Modalities of Interest": recentlyRemoved.modalities.map(filter => filter.label)
                //         },
                //     })
                // }

                set({
                    filters: newFilters,
                    lastFetchedPage: 1,
                    searchResults: newSearchResults,
                    totalResults: total,
                })
            },
            totalResults: undefined,
            setTotalResults: (total: number) => set({totalResults: total}),
            // resultsPerPage: 10,
            // setResultsPerPage: (results: number) => {
            //     set({resultsPerPage: results})
            // }
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
)
