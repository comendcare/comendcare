import React from "react"
import { getSession } from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@/packages/components/types"
import { biosampleSearchParamsCache } from "@/packages/components/biorepo/advanced-data-table/lib/validations"
import { getValidFilters } from "@/packages/lib/data-table"
import { PrivateBiosampleToolsPage } from "~web/components/private-biosample-tools-page"
import { getBiosamples } from "@/packages/components/biorepo/advanced-data-table/lib/queries"

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function BiosampleToolsPage(props: IndexPageProps) {
    const session = await getSession()
    const orgId = session?.user.organizationId

    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);

    const validFilters = getValidFilters(search.filters);

    const promises = Promise.all([
        getBiosamples({
            ...search,
            filters: validFilters,
        }),
    ]);

    if (!orgId) return <NoOrganization />
    return <PrivateBiosampleToolsPage search={search} validFilters={validFilters} promises={promises}/>
}
