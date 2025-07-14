import React from "react"
import { getSession } from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@/packages/components/types"
import { biosampleSearchParamsCache } from "@/packages/components/biorepo/advanced-data-table/lib/validations"
import { getValidFilters } from "@/packages/lib/data-table"
import { getDatasamples } from "@/packages/components/biorepo/advanced-data-table/lib/queries"
import { PrivateDatasampleToolsPage } from "~web/components/private-datasample-tools-page"

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

    const promises = Promise.all([
        getDatasamples({
            ...search,
            filters: validFilters,
        }),
    ]);

    if (!orgId) return <NoOrganization />
    return <PrivateDatasampleToolsPage promises={promises} />
}
