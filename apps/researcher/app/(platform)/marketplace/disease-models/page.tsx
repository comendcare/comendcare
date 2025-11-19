import React from "react"
import {SearchParams} from "@/packages/components/types"
import {getValidFilters} from "@/packages/lib/data-table"
import { getDiseaseModels } from "@/packages/lib/fetchers"
import { biosampleSearchParamsCache } from "@/packages/lib/validations"
import { DiseaseModelMarketplacePage } from "~researcher/components/marketplace/disease-model-tools-page"
import { useDiseaseModelsTableColumns } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function DiseaseModelToolsPage(props: IndexPageProps) {
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const columns = useDiseaseModelsTableColumns(true, true, false)

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
        },
        {...search, q: globalFilter, filters: validFilters},
        true, // public only
        columns
    )

    return (
        <DiseaseModelMarketplacePage 
            data={[...data]} 
            pageCount={pageCount} 
            searchParams={searchParams} 
        />
    )
}