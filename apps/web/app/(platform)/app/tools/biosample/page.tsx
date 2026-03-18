import React from "react"
import { getSession } from "@comend/lib/auth"
import NoOrganization from "~web/components/no-organization"
import { SearchParams } from "@comend/components/types"
import { biosampleSearchParamsCache } from "@comend/lib/validations"
import { getValidFilters } from "@comend/lib/data-table"
import { PrivateBiosampleToolsPage } from "~web/components/private-biosample-tools-page"
import { getBiosamples } from "@comend/lib/fetchers"
import { useBiosamplesTableColumns } from "@comend/components/biorepo/advanced-data-table/biosamples-table/private-biosamples-table-columns"

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
            bsiId: true,

            milestones: {include: {milestone: true}},
            donorId: true,
            donor: {
                include: {
                    diagnoses: {
                        include: {type: true}
                    }
                }
            },
            institutionId: true,
            institution: true,
            company: true,
            geneId: true,
            gene: true,
            genes: true,
            organizationId: true,
            organization: {include: {
                members: true
            }},
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
