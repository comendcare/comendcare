import React from "react"
import Image from "next/image"
import { getSession } from "@/packages/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@/packages/components/types"
import { biosampleSearchParamsCache } from "@/packages/components/biorepo/advanced-data-table/lib/validations"
import { getValidFilters } from "@/packages/lib/data-table"
import { PrivateBiosampleToolsPage } from "~web/components/private-biosample-tools-page"
import { NewToolDialog } from "~web/components/edit-tool-dialog"
import { getBiosamples } from "@/packages/lib/fetchers"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>
}

export default async function BiosampleToolsPage(props: IndexPageProps) {
    const session = await getSession()
    const orgId = session?.user.organizationId
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);

    const {data, pageCount} = await getBiosamples(
        session?.user.organizationId,
        {...search, filters: validFilters}
    )

    // not part of an org
    if (!orgId) return <NoOrganization />
    return <PrivateBiosampleToolsPage data={[...data]} pageCount={pageCount} searchParams={searchParams} />
}
