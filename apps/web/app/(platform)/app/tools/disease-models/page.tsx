import React from "react"
import Image from "next/image"
import { getSession } from "@/packages/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@/packages/components/types"
import { diseaseModelSearchParamsCache } from "@/packages/lib/validations"
import { getValidFilters } from "@/packages/lib/data-table"
import { NewToolDialog } from "~web/components/edit-tool-dialog"
import { getDiseaseModels } from "@/packages/lib/fetchers"
import { PrivateDiseaseModelToolsPage } from "~web/components/private-disease-model-tools-page"

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
            // pinned: true,
            // metadata: true,
            types: true,
            genotype: true,
            strain: true,
            notes: true,

            institutionId: true,
            institution: true,
            geneId: true,
            gene: true,
            conditionId: true,
            condition: true,
            organizationId: true,
            organization: {include: {conditions: {include: {condition: true}}}},
            milestones: {include: {milestone: true}},
        },
        {...search, q: globalFilter, filters: validFilters},
    )

    // not part of an org
    if (!orgId) return <NoOrganization />
    return <PrivateDiseaseModelToolsPage data={[...data]} pageCount={pageCount} searchParams={searchParams} />
}
