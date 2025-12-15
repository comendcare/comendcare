import { typesense } from '@comend/lib/typesense';
import { nanoid } from 'nanoid';
import { temporal } from 'zundo';
import { create } from 'zustand';
import { ASSOCIATED_CATEGORIES, Milestone } from '@comend/lib/types'
import { getExclusiveToFirstGroup, sleep } from '@comend/lib/utils';
import { mixpanelTrack } from "@comend/lib/mixpanel";
import { SearchResponse } from 'typesense/lib/Typesense/Documents';

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
    openTo: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    status: {
        label: string,
        value: string,
        disable?: boolean,
    }[],
    organizations: {
        label: string,
        value: string,
        disable?: boolean,
    }[]
}

export const defaultFilters = {
    conditions: [],
    genes: [],
    openTo: [],
    status: [],
    organizations: []
}

function generateFiltersString(filters: FiltersType): string {
    let filtersList: string[] = [];

    const escapeValue = (value: string) => `\`${value}\``;

    // conditions
    if (filters?.conditions && filters.conditions.length > 0) {
        const conditionFilter = filters.conditions
            .map(condition => `condition.name:=[${escapeValue(condition.value)}]`)
            .join(" || ");
        filtersList.push(`(${conditionFilter})`);
    }

    // genes
    if (filters?.genes && filters.genes.length > 0) {
        const geneFilter = filters.genes
            .map(gene => `condition.causalGenes:=${escapeValue(gene.value)} || condition.associatedGenes:=${escapeValue(gene.value)}`)
            .join(" || ");
        filtersList.push(`(${geneFilter})`);
    }

    // open to 
    if (filters?.openTo && filters.openTo.length > 0) {
        const openToFilter = filters.openTo
            .map(openTo => `openTo:=[${escapeValue(openTo.value)}]`)
            .join(" || ");
        filtersList.push(`(${openToFilter})`);
    }

    // status
    if (filters?.status && filters.status.length > 0) {
        const statusFilter = filters.status
            .map(status => `status:=[${escapeValue(status.value)}]`)
            .join(" || ");
        filtersList.push(`(${statusFilter})`);
    }

    // Organizations
    // if (filters?.organizations && filters.organizations.length > 0) {
    //     const organizationFilter = filters.organizations
    //         .map(organization => `organization.id:=[${escapeValue(organization.value)}]`)
    //         .join(" || ");
    //     filtersList.push(`(${organizationFilter})`);
    // }

    // Combine all filters with `&&`
    const typesenseFilters = filtersList.length > 0 ? filtersList.join(" && ") : "";

    console.log(`Typesense filters: ${typesenseFilters}`);
    return typesenseFilters;
}

const sortByFilters: { [key: string]: string } = {
    "default": "sort_rank:asc",
}

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 2,          // usually 2 extra attempts
  waitMs = 150           // small backoff
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (attempts <= 0) throw err;
    await new Promise(r => setTimeout(r, waitMs));
    return withRetry(fn, attempts - 1, waitMs * 2);
  }
}

const getUpdatedSearchResults = async (
    state: any,
    isNewSearch: boolean = true
): Promise<{results: any[], total: number, totalPages: number}> => {
    const getResults = async (
        state: any,
        isNewSearch: boolean = true
    ) => {
        const filtersString = generateFiltersString(state.filters)
        const searchParameters = {
            q: state.searchTerm,
            query_by: "title,description,organization.name,condition.name,condition.causalGenes,condition.associatedGenes",
            per_page: 12,
            page: Math.min(state.lastFetchedPage, state.totalPages), // don't fetch any pages out of range
            ...(filtersString ? { filter_by: filtersString } : undefined),
            sort_by: sortByFilters[state.sortBy],
        };

        const results: SearchResponse<Object> = await typesense
            .collections("rfps")
            .documents()
            .search(searchParameters);

        const typeSenseHits = results.hits || [];
        // @ts-ignore
        const ids = typeSenseHits.map(hit => hit.document.id);

        if (ids.length === 0) {
            return {
                results: isNewSearch ? [] : state.searchResults,
                total: results.found || 0,
                totalPages: Math.ceil(results.out_of/12)
            }
        }

        const prismaResponse = await fetch('/api/rfps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids }),
        });

        if (!prismaResponse.ok) {
            const text = await prismaResponse.text() // may be empty or HTML on 405
            throw new Error(`POST /api/rfps failed: ${prismaResponse.status} ${text}`)
        }

        const prismaResults = await prismaResponse.json();

        const enrichedResults = ids.map((id: string) => prismaResults.find((company: any) => company.id === id) || null).filter(Boolean);

        return {
            results: isNewSearch ? enrichedResults : [...state.searchResults, ...enrichedResults],
            total: results.found || 0,
            totalPages: Math.ceil(results.out_of/12)
        };
    }

    return await withRetry(() => getResults(state, isNewSearch))
};

export interface RFPSearchState {
    initialized: boolean,
    initState: (filters: FiltersType) => Promise<void>,
    featured: any[],
    searchTerm: string,
    setSearchTerm: (newSearch: string) => void,
    sortBy: string,
    setSortBy: (sortBy: string | undefined) => void,
    totalPages: number,
    setTotalPages: (page: number) => void,
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

export const useRFPSearchStore = create<RFPSearchState>()(
    temporal((set, get) => ({
            initialized: false,
            initState: async (filters: FiltersType) => {
                // set featured RFPs
                const ids = 
                    process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
                        ? [
                            // 'cm6f847kk0000g1r3mkm3zh62', // AGSAA
                            // // 'cmdrkqiqv0000w45azqlanvcd', // CDLS
                            // 'cm6fg095e0000120vrcke39q1', // MED13L
                            // // 'cm6quxnmv00007qh34myx7zr7', // Rory Belle Foundation
                            // 'cmigvoy9i0001pggn86mnttlx', // ZTTK
                            // // ADD PROJECT 8P WHEN THEY'VE CREATED THEIR ACCOUNT
                            
                        ]
                        : []

                console.log(`IDS`, ids)
                const prismaResponse = await fetch('/api/rfps', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ids}),
                });
                console.log(`prisma response`, prismaResponse)
                const prismaResults = await prismaResponse.json();

                console.log(`featured orgs`, prismaResults)
                const featured = ids.map(id => prismaResults.find((org: any) => org.id === id) || null).filter(Boolean);

                set({ 
                    featured,
                    filters, 
                    searchTerm: '', 
                    lastFetchedPage: 1, 
                    sortBy: "default" ,
                })

                const { results, total, totalPages } = await getUpdatedSearchResults({
                    ...get(),
                    sortBy: "default",
                    lastFetchedPage: 1,
                }, true)

                set({ 
                    initialized: true, 
                    sortBy: "default", 
                    searchResults: results, 
                    lastFetchedPage: 1, 
                    totalResults: total,
                    totalPages: totalPages
                })
            },
            featured: [],
            searchTerm: '',
            setSearchTerm: async (newSearch: string) => {
                const { results, total, totalPages } = await getUpdatedSearchResults({
                    ...get(),
                    searchTerm: newSearch,
                    lastFetchedPage: 1,
                }, true)

                if (newSearch.length > 0) {
                    // only track searches if the user has entered text in the searchbar
                    const filters = get().filters
                    // mixpanelTrack("Search Service Providers", {
                    //     "Search Term": newSearch,
                    //     "Results": total,
                    //     "Filters": {
                    //         "Milestone Types": filters.milestoneTypes.map(filter => filter.label),
                    //         "Business Types": filters.types.map(filter => filter.label),
                    //         "Certifications": filters.certifications.map(filter => filter.label),
                    //         "Tags": filters.tags.map(filter => filter.label),
                    //         "Categories": filters.categories.map(filter => filter.label)
                    //     }
                    // })
                }

                set({
                    searchTerm: newSearch,
                    searchResults: results,
                    lastFetchedPage: 1,
                    totalResults: total,
                    totalPages: totalPages
                })
            },
            sortBy: "default",
            setSortBy: async (sortBy: string | undefined) => {
                const { results, total, totalPages } = await getUpdatedSearchResults({
                    ...get(),
                    sortBy,
                    lastFetchedPage: 1,
                }, true)
                set({ sortBy, searchResults: results, lastFetchedPage: 1, totalResults: total, totalPages })
            },
            totalPages: 1,
            setTotalPages: (page: number) => {
                set({totalPages: page})
            },
            lastFetchedPage: 1, // page numbers in TypeSense start at 1
            setLastFetchedPage: async (page: number) => {
                // don't search if we've already gotten to the last page
                if (page > get().totalPages) return

                const {results: updateSearchResults, totalPages} = await getUpdatedSearchResults({
                    ...get(),
                    lastFetchedPage: page
                }, false)
                set({ lastFetchedPage: Math.min(page, totalPages), searchResults: updateSearchResults, totalPages })
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
                const { results, total, totalPages } = await getUpdatedSearchResults({
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
                    // mixpanelTrack("Marketplace Service Provider Filters Selected", {
                    //     "Results": total,
                    //     "Filters": {
                    //         "Milestone Types": newFilters.milestoneTypes.map(filter => filter.label),
                    //         "Business Types": newFilters.types.map(filter => filter.label),
                    //         "Certifications": newFilters.certifications.map(filter => filter.label),
                    //         "Tags": newFilters.tags.map(filter => filter.label),
                    //         "Categories": newFilters.categories.map(filter => filter.label)
                    //     },
                    //     "Added": {
                    //         "Milestone Types": recentlySelected.milestoneTypes.map(filter => filter.label),
                    //         "Business Types": recentlySelected.types.map(filter => filter.label),
                    //         "Certifications": recentlySelected.certifications.map(filter => filter.label),
                    //         "Categories": recentlySelected.categories.map(filter => filter.label),
                    //         "Tags": recentlySelected.tags.map(filter => filter.label)
                    //     },
                    //     "Removed": {
                    //         "Milestone Types": recentlyRemoved.milestoneTypes.map(filter => filter.label),
                    //         "Business Types": recentlyRemoved.types.map(filter => filter.label),
                    //         "Certifications": recentlyRemoved.certifications.map(filter => filter.label),
                    //         "Categories": recentlyRemoved.categories.map(filter => filter.label),
                    //         "Tags": recentlyRemoved.tags.map(filter => filter.label)
                    //     },
                    // })
                }

                set({
                    filters: newFilters,
                    lastFetchedPage: 1,
                    searchResults: results,
                    totalResults: total,
                    totalPages: totalPages
                })
            },
            totalResults: undefined,
            setTotalResults: (total: number) => set({ totalResults: total }),
        }),
        {
            limit: 100, // limit the stored history states to 100
        })
    )
