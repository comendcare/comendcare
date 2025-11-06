import React from "react"
import Image from "next/image"
import { getSession } from "@/packages/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@/packages/components/types"
import { biosampleSearchParamsCache } from "@/packages/lib/validations"
import { getValidFilters } from "@/packages/lib/data-table"
import { PrivateDatasampleToolsPage } from "~web/components/private-datasample-tools-page"
import { NewToolDialog } from "~web/components/edit-tool-dialog"
import { getClinicalDatasets } from "@/packages/lib/fetchers"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function DataToolsPage(props: IndexPageProps) {
    const session = await getSession()
    const orgId = session?.user.organizationId
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const {data, pageCount} = await getClinicalDatasets(
        session?.user.organizationId,
        {
            id: true,
            createdAt: true,
            updatedAt: true,

            title: true,
            cohortSize: true,
            description: true,
            contacts: true,
            attachments: true,
            private: true,
            // pinned: true,
            // metadata: true,
            types: true,
            notes: true,

            institutionId: true,
            institution: true,
            company: true,
            geneId: true,
            gene: true,
            genes: true,
            organizationId: true,
            organization: {include: {conditions: {include: {condition: true}}}},
            milestones: {include: {milestone: true}},
        },
        {...search, q: globalFilter, filters: validFilters}
    )

    console.log(`data`, data)

    // not part of an org
    if (!orgId) return <NoOrganization />
    return <PrivateDatasampleToolsPage data={[...data]} pageCount={pageCount} searchParams={searchParams} />
}
