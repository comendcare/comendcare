import React from "react"
import Image from "next/image"
import { getSession } from "@/packages/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@/packages/components/types"
import { biosampleSearchParamsCache } from "@/packages/lib/validations"
import { getValidFilters } from "@/packages/lib/data-table"
import { PrivateBiosampleToolsPage } from "~web/components/private-biosample-tools-page"
import { NewToolDialog } from "~web/components/edit-tool-dialog"
import { getBiosamples } from "@/packages/lib/fetchers"
import { useBiosamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/private-biosamples-table-columns"
import { Session } from "next-auth"

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
    const globalFilter = search.q ?? "";

    const columns = useBiosamplesTableColumns({session: session as any})

    const {data, pageCount} = await getBiosamples(
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
            variant: true,
            availability: true,
            quantity: true,
            quantityUnit: true,
            currentCountry: true,
            countryOfCollection: true,
            preservationMethod: true,
            anatomicalSite: true,
            methodOfTransport: true,
            collectionDate: true,
            ageAtCollection: true,
            price: true,
            priceUnit: true,
            notes: true,

            milestones: {include: {milestone: true}},
            donorId: true,
            donor: {
                include: {diagnoses: {include: {type: true}}}
            },
            institutionId: true,
            institution: true,
            company: true,
            geneId: true,
            gene: true,
            genes: true,
            organizationId: true,
            organization: true,
            materialAndDataAccessRequests: true
        },
        {...search, q: globalFilter, filters: validFilters},
        false,
        columns
    )

    // not part of an org
    if (!orgId) return <NoOrganization />
    return <PrivateBiosampleToolsPage data={[...data]} pageCount={pageCount} searchParams={searchParams} />
}
