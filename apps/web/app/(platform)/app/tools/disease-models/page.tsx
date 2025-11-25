import React from "react"
import Image from "next/image"
import { getSession } from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@comend/components/types"
import { diseaseModelSearchParamsCache } from "@comend/lib/validations"
import { getValidFilters } from "@comend/lib/data-table"
import { getDiseaseModels } from "@comend/lib/fetchers"
import { PrivateDiseaseModelToolsPage } from "~web/components/private-disease-model-tools-page"
import { useDiseaseModelsTableColumns } from "@comend/components/biorepo/advanced-data-table/disease-models-table/private-disease-models-table-columns"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

export default async function DiseaseModelToolsPage(props: IndexPageProps) {
    const session = await getSession()
    const orgId = session?.user.organizationId
    const searchParams = await props.searchParams;
    const search = diseaseModelSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const columns = useDiseaseModelsTableColumns({session: session as any})

    const {data, pageCount} = await getDiseaseModels(
        session?.user.organizationId,
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
        false, // public & private disease models
        columns,
    )

    // not part of an org
    if (!orgId) return <NoOrganization />
    return <PrivateDiseaseModelToolsPage data={[...data]} pageCount={pageCount} searchParams={searchParams} />
}
