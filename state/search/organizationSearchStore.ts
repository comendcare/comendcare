import {mechanisms} from "@comend/lib/types";
import {typesense} from '@comend/lib/typesense';
import {temporal} from 'zundo';
import {create} from 'zustand';
import { getExclusiveToFirstGroup } from '@comend/lib/utils';
import { mixpanelTrack } from "@comend/lib/mixpanel";
import { isEqual } from 'lodash';

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
}

export const defaultFilters = {
    conditions: [],
    genes: [],
    mechanisms: [],
    systems: [],
    modalities: [],
}

function generateFiltersString(filters: FiltersType) {
    let filtersList: string[] = []

    const escapeValue = (value: string) => `\`${value}\``;

    if (filters?.conditions && filters.conditions.length > 0) {
        const conditionFilter = filters.conditions
            .map(condition => `conditions.condition.name:=${escapeValue(condition.value)}`)
            .join(" || ");
        filtersList.push(`(${conditionFilter})`);
    }

    if (filters?.genes && filters.genes.length > 0) {
        const geneFilter = filters.genes
            .map(gene => `conditions.condition.causalGenes:=${escapeValue(gene.value)} || conditions.condition.associatedGenes:=${escapeValue(gene.value)}`)
            .join(" || ");
        filtersList.push(`(${geneFilter})`);
    }

    if (filters?.systems && filters.systems.length > 0) {
        const systemFilters = filters.systems
            .map(system => `conditions.condition.associatedSystems:="${escapeValue(system.value)}"`)
            .join(" || ");

        filtersList.push(`(${systemFilters})`);
    }

    if (filters?.mechanisms && filters.mechanisms.length > 0) {
        const mechanismFilters = filters.mechanisms
            .map(system => `conditions.condition.relevantDiseaseMechanisms:="${escapeValue(system.value)}"`)
            .join(" || ");

        filtersList.push(`(${mechanismFilters})`);
    }

    if (filters?.modalities && filters.modalities.length > 0) {
        const modalityFilters = filters.modalities
            .map(modality => `therapeuticsOfInterest:="${escapeValue(modality.label)}"`)
            .join(" || ");

        filtersList.push(`(${modalityFilters})`);
    }

    const typesenseFilters = filtersList.length > 0 ? filtersList.join(" && ") : "";

    console.log(`typesense filters: `, typesenseFilters)
    return typesenseFilters
}

const sortByFilters: { [key: string]: string } = {
    "recently-updated": "updatedAt:desc",
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

const getUpdatedSearchResults = async (state: any, isNewSearch: boolean = true): Promise<{results: any[], total: number}> => {
    try {
        // const searchParameters = {
        //     q: state.searchTerm,
        //     query_by: "name,description",
        //     per_page: 10,
        //     page: state.lastFetchedPage,
        //     ...(generateFiltersString(state.filters) ? {filter_by: generateFiltersString(state.filters)} : undefined),
        //     ...(state.sortBy ? {sort_by: sortByFilters[state.sortBy]} : undefined),
        // };
        const TAG_PRIORITY_SORT = "";

        const filtersString = generateFiltersString(state.filters)

        console.log(`FILTERS STRING`, filtersString)

        // Merge tag-priority sort with user-chosen sort
        let sortBy = TAG_PRIORITY_SORT;
        if (state.sortBy && sortByFilters[state.sortBy]) {
            sortBy += `,${sortByFilters[state.sortBy]}`;
        }

        const searchParameters = {
            q: state.searchTerm,
            query_by: "name,description",
            per_page: 10,
            page: state.lastFetchedPage,
            ...(filtersString ? { filter_by: filtersString } : undefined),
            ...(state.sortBy ? {sort_by: sortByFilters[state.sortBy]} : undefined),
        };

        const results = await typesense
            .collections("organizations")
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

        const prismaResponse = await fetch('/api/organizations', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ids}),
        });

        const prismaResults = await prismaResponse.json();

        const enrichedResults = ids.map(id => prismaResults.find((org: any) => org.id === id) || null).filter(Boolean);

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

export interface OrganizationSearchState {
    initialized: boolean,
    initState: (filters: FiltersType) => Promise<void>,
    featuredOrgs: any[],
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

export const useOrganizationSearchStore = create<OrganizationSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: async (filters: FiltersType) => {
                // temporarily set featured orgs for global genes!
                const ids = 
                    process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
                        ? [
                            'cm6f847kk0000g1r3mkm3zh62', // AGSAA
                            'cmdrkqiqv0000w45azqlanvcd', // CDLS
                            'cm6quxnmv00007qh34myx7zr7', // Rory Belle Foundation
                            // ADD PROJECT 8P WHEN THEY'VE CREATED THEIR ACCOUNT
                        ]
                        : [
                            'cmd3i7su6000fmgom1v8umgfk' // arcadion is first in preview & development environments, for testing purposes
                        ]
                console.log(`IDS`, ids)
                const prismaResponse = await fetch('/api/organizations', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ids}),
                });
                console.log(`prisma response`, prismaResponse)
                const prismaResults = await prismaResponse.json();

                console.log(`featured orgs`, prismaResults)
                const featuredOrgs = ids.map(id => prismaResults.find((org: any) => org.id === id) || null).filter(Boolean);

                set({initialized: true, filters, featuredOrgs})
            },
            featuredOrgs: [],
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
                    mixpanelTrack("Search Organizations", {
                        "Search Term": newSearch,
                        "Results": total,
                        "Filters": {
                            "Mechanisms of Action": filters.mechanisms.map(filter => filter.label),
                            "Associated Systems": filters.systems.map(filter => filter.label),
                            "Modalities of Interest": filters.modalities.map(filter => filter.label)
                        }
                    })
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

                const recentlySelected = {
                    mechanisms: getExclusiveToFirstGroup(newFilters, get().filters, 'mechanisms'),
                    systems: getExclusiveToFirstGroup(newFilters, get().filters, 'systems'),
                    modalities: getExclusiveToFirstGroup(newFilters, get().filters, 'modalities')
                }

                const recentlyRemoved = {
                    mechanisms: getExclusiveToFirstGroup(get().filters, newFilters, 'mechanisms'),
                    systems: getExclusiveToFirstGroup(get().filters, newFilters, 'systems'),
                    modalities: getExclusiveToFirstGroup(get().filters, newFilters, 'modalities')
                }

                if (Object.values(recentlySelected).flatMap(value => value).length > 0 || Object.values(recentlyRemoved).flatMap(value => value).length > 0) {
                    // only track in mixpanel if something in the filters has been updated
                    mixpanelTrack("Marketplace Organization Filters Selected", {
                        "Results": total,
                        "Filters": {
                            "Mechanisms of Action": newFilters.mechanisms.map(filter => filter.label),
                            "Associated Systems": newFilters.systems.map(filter => filter.label),
                            "Modalities of Interest": newFilters.modalities.map(filter => filter.label)
                        },
                        "Added": {
                            "Mechanisms of Action": recentlySelected.mechanisms.map(filter => filter.label),
                            "Associated Systems": recentlySelected.systems.map(filter => filter.label),
                            "Modalities of Interest": recentlySelected.modalities.map(filter => filter.label)
                        },
                        "Removed": {
                            "Mechanisms of Action": recentlyRemoved.mechanisms.map(filter => filter.label),
                            "Associated Systems": recentlyRemoved.systems.map(filter => filter.label),
                            "Modalities of Interest": recentlyRemoved.modalities.map(filter => filter.label)
                        },
                    })
                }

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
