import { useBiosamplesTableColumns } from "@comend/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns"
import { SearchParams } from "@comend/components/types"
import { getBiosamples, getClinicalDatasets, getDiseaseModels } from "@comend/lib/fetchers"
import { getValidFilters } from "@comend/lib/data-table"
import { biosampleSearchParamsCache } from "@comend/lib/validations"
import MarketplaceExplorePage from "./marketplace-expore"
import { FeatureFlagsProvider } from "@comend/components/biorepo/advanced-data-table/lib/feature-flags-provider"
import { useDiseaseModelsTableColumns } from "@comend/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns"
import { useClinicalDatasetsTableColumns } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns"

interface IndexPageProps {
    searchParams: Promise<SearchParams>;
}

export default async function MarketplacePage(props: IndexPageProps) {
    const searchParams = await props.searchParams;
    const search = biosampleSearchParamsCache.parse(searchParams);
    const validFilters = getValidFilters(search.filters);
    const globalFilter = search.q ?? "";

    const biosampleColumns = useBiosamplesTableColumns(true, true, false)
    const diseaseModelColumns = useDiseaseModelsTableColumns(true, true, false)
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns(true, true, false)

    const {data: biosampleData} = await getBiosamples(
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
        {...search, q: globalFilter, filters: validFilters, page: 1, perPage: 3},
        true, // public only
        biosampleColumns,
    )

    const {data: diseaseModelData} = await getDiseaseModels(
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
            strain: true,
            notes: true,
            institutionId: true,
            institution: true,
            company: true,
            geneId: true,
            gene: true,
            genes: true,
            conditionId: true,
            condition: true,
            organizationId: true,
            organization: {include: {conditions: {include: {condition: true}}}},
            milestones: {include: {milestone: true}},
        },
        {...search, q: globalFilter, filters: validFilters, page: 1, perPage: 3},
        true, // public only
        diseaseModelColumns
    )

    const {data: clinicalDatasetData} = await getClinicalDatasets(
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
        {...search, q: globalFilter, filters: validFilters, page: 1, perPage: 3},
        true, // public only
        clinicalDatasetColumns
    )

    return (
        <FeatureFlagsProvider>
        <MarketplaceExplorePage 
            biosampleData={biosampleData}
            diseaseModelData={diseaseModelData}
            clinicalDatasetData={clinicalDatasetData}
            searchParams={searchParams} 
        />
        </FeatureFlagsProvider>
    )
}
