import React from "react"
import {SearchParams} from "@/packages/components/types"
import {getValidFilters} from "@/packages/lib/data-table"
import { getDiseaseModels } from "@/packages/lib/fetchers"
import { biosampleSearchParamsCache } from "@/packages/lib/validations"
import { DiseaseModelMarketplacePage } from "~researcher/components/marketplace/disease-model-tools-page"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function DiseaseModelToolsPage(props: IndexPageProps) {
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const {data, pageCount} = await getDiseaseModels(
        undefined,
        {
            id: true,
            createdAt: true,
            updatedAt: true,

            description: true,
            contacts: true,
            attachments: true,
            private: true,
            // pinned: true,
            // metadata: true,
            types: true,
            genotype: true,
            strain: true,
            notes: true,

            institutionId: true,
            institution: true,
            company: true,
            geneId: true,
            gene: true,
            genes: true,
            conditionId: true,
            condition: true,
            organizationId: true,
            organization: {include: {conditions: {include: {condition: true}}}},
            milestones: {include: {milestone: true}},
            // id: true,
            // createdAt: true,
            // updatedAt: true,
            // description: true,
            // contacts: true,
            // attachments: true,
            // private: true,
            // types: true,
            // genotype: true,
            // variant: true,
            // availability: true,
            // quantity: true,
            // quantityUnit: true,
            // currentCountry: true,
            // countryOfCollection: true,
            // preservationMethod: true,
            // anatomicalSite: true,
            // methodOfTransport: true,
            // collectionDate: true,
            // ageAtCollection: true,
            // price: true,
            // priceUnit: true,
            // notes: true,

            // milestones: {include: {milestone: true}},
            // donorId: true,
            // donor: {
            //     include: {diagnoses: {include: {type: true}}}
            // },
            // institutionId: true,
            // institution: true,
            // company: true,
            // geneId: true,
            // gene: true,
            // genes: true,
            // organizationId: true,
            // organization: {include: {conditions: {include: {condition: true}}}},
            // materialAndDataAccessRequests: true
        },
        {...search, q: globalFilter, filters: validFilters},
        true // public only
    )

    return (
        <DiseaseModelMarketplacePage 
            data={[...data]} 
            pageCount={pageCount} 
            searchParams={searchParams} 
        />
    )
}