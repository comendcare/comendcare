import React from "react"
import { getSession } from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { PrivateToolsPage } from "~web/components/private-tools-page"
import { SearchParams } from "@/packages/components/types"
import { searchParamsCache } from "@/packages/components/biorepo/advanced-data-table/lib/validations"
import { getValidFilters } from "@/packages/lib/data-table"

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function BiosampleToolsPage(props: IndexPageProps) {
    const session = await getSession()
    const orgId = session?.user.organizationId

    const searchParams = await props.searchParams;
    const search = searchParamsCache.parse(searchParams);

    const validFilters = getValidFilters(search.filters);

    if (!orgId) return <NoOrganization />
    return <PrivateToolsPage type={'biosample'} search={search} validFilters={validFilters}/>
}
