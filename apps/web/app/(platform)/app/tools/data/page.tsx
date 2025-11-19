import React from "react"
import { getSession } from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@comend/components/types"
import { biosampleSearchParamsCache } from "@comend/lib/validations"
import { getValidFilters } from "@comend/lib/data-table"
import { PrivateDatasampleToolsPage } from "~web/components/private-datasample-tools-page"
import { getClinicalDatasets } from "@comend/lib/fetchers"
import { getClinicalDatasetsTableColumns } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/private-clinical-datasets-table-columns"

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

    const columns = getClinicalDatasetsTableColumns({session: session as any})

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
        {...search, q: globalFilter, filters: validFilters},
        false,
        columns
    )

    // not part of an org
    if (!orgId) return <NoOrganization />
    return <PrivateDatasampleToolsPage data={[...data]} pageCount={pageCount} searchParams={searchParams} />
}
