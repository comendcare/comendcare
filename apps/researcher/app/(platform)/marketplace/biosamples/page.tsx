import React from "react"
import Image from "next/image"
import {getSession} from "@comend/lib/auth"
import {SearchParams} from "@comend//components/types"
import {getValidFilters} from "@comend/lib/data-table"
import { getBiosamples } from "@comend/lib/fetchers"
import { biosampleSearchParamsCache } from "@comend/lib/validations"
import { BiosampleMarketplacePage } from "~researcher/components/marketplace/biosample-tools-page"
import { useBiosamplesTableColumns } from "@comend/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function BiosampleToolsPage(props: IndexPageProps) {
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const columns = useBiosamplesTableColumns(true, true, false)

    const {data, pageCount} = await getBiosamples(
        undefined,
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
            organization: {include: {conditions: {include: {condition: true}}}},
            materialAndDataAccessRequests: true
        },
        {...search, q: globalFilter, filters: validFilters},
        true, // public only
        columns,
    )

    return (
        <BiosampleMarketplacePage 
            data={[...data]} 
            pageCount={pageCount} 
            searchParams={searchParams} 
        />
    )
}
