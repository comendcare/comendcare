import React from "react"
import Image from "next/image"
import {getSession} from "@comend/lib/auth"
import {SearchParams} from "@comend/components/types"
import {getValidFilters} from "@comend/lib/data-table"
import { getBiosamples, getClinicalDatasets } from "@comend/lib/fetchers"
import { biosampleSearchParamsCache } from "@comend/lib/validations"
import { BiosampleMarketplacePage } from "~researcher/components/marketplace/biosample-tools-page"
import { ClinicalDatasetMarketplacePage } from "~researcher/components/marketplace/clinical-dataset-tools-page"
import { useClinicalDatasetsTableColumns } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns"

export const dynamic = "force-dynamic";

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function ClinicalDatasetsToolsPage(props: IndexPageProps) {
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const columns = useClinicalDatasetsTableColumns(true, true, false)

    const {data, pageCount} = await getClinicalDatasets(
        undefined,
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
        true, // public only
        columns
    )

    return (
        <ClinicalDatasetMarketplacePage 
            data={[...data]} 
            pageCount={pageCount} 
            searchParams={searchParams} 
        />
    )
}
