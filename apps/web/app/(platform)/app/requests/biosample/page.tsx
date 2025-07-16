import React from "react"
import { getSession } from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@/packages/components/types"
import { biosampleRequestsSearchParamsCache } from "@/packages/components/biorepo/advanced-data-table/lib/validations"
import { getValidFilters } from "@/packages/lib/data-table"
import { getBiosampleRequests } from "@/packages/components/biorepo/advanced-data-table/lib/queries"
import { PrivateBiosampleRequestsPage } from "~web/components/biosample-requests-page"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function BiosampleRequestsPage(props: IndexPageProps) {
    const session = await getSession()
    const orgId = session?.user.organizationId
    const searchParams = await props.searchParams;
    const search = biosampleRequestsSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);

    const promises = Promise.all([
        getBiosampleRequests(
            session?.user.organizationId,
            {...search, filters: validFilters}
        ),
    ]);

    if (!orgId) return <NoOrganization />
    return <PrivateBiosampleRequestsPage promises={promises} />
}