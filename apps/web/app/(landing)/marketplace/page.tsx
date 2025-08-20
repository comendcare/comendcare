"use client"

import { BiosamplesTable } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table"
import { useBiosamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns"
import { ClinicalDatasetsTable } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table"
import { useClinicalDatasetsTableColumns } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns"
import { DiseaseModelsTable } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table"
import { useDiseaseModelsTableColumns } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns"
import { Card, CardDescription, CardHeader, CardTitle } from "@/packages/components/ui/card"
import { Separator } from "@/packages/components/ui/separator"
import { Skeleton } from "@/packages/components/ui/skeleton"
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore"
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore"
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore"
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"
import { OrganizationMarketplaceListElement } from "~web/components/marketplace/marketplace-pag-list-element"

const organizationSelector = (state: OrganizationSearchState) => ({
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

const biosampleSelector = (state: BiosampleSearchState) => ({
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

const diseaseModelSelector = (state: DiseaseModelSearchState) => ({
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

const clinicalDatsetSelector = (state: ClinicalDatasetSearchState) => ({
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

export default function MarketplacePage() {
    const organizationStore = useOrganizationSearchStore(useShallow(organizationSelector))
    const biosampleStore = useBiosampleSearchStore(useShallow(biosampleSelector))
    const diseaseModelStore = useDiseaseModelSearchStore(useShallow(diseaseModelSelector))
    const clinicalDatasetStore = useClinicalDatasetSearchStore(useShallow(clinicalDatsetSelector))
    const biosampleColumns = useBiosamplesTableColumns()
    const diseaseModelColumns = useDiseaseModelsTableColumns()
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns()

    useEffect(() => {
        organizationStore.setSearchTerm("")
        biosampleStore.setSearchTerm("")
        diseaseModelStore.setSearchTerm("")
        clinicalDatasetStore.setSearchTerm("")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    return (
        <main className="max-w-7xl flex flex-col w-full px-4 pb-20 h-full mx-auto gap-8">
            
            <div className="flex flex-col gap-2">
                {/* <div className="p-10 flex flex-col gap-2 bg-blue-light rounded-lg mb-6">
                    <h2 className="text-2xl font-semibold">Patient Groups</h2>
                    <p>Find and connect with other patient groups in Comend's rare disease network. Create a profile to join the marketplace.</p>
                </div> */}
                <h2 className="text-2xl semibold">Patient Groups</h2>
                <ol className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {(organizationStore.searchResults && organizationStore.searchResults.length > 0 )
                        ? (
                            <>
                                {organizationStore.searchResults?.slice(0, 3).map((organization, index) => (
                                    <OrganizationMarketplaceListElement organization={organization} key={index}/>
                                ))}
                            </>
                        )
                        : (
                            <>
                                <Skeleton className="h-[286px] w-full"/>
                                <Skeleton className="h-[286px] w-full"/>
                                <Skeleton className="h-[286px] w-full"/>
                            </>
                        )
                    }
                </ol>
                <a href="/marketplace/patient-groups" className="justify-self-end self-end underline">See all patient groups...</a>
            </div>

            {/* <Separator /> */}

            <div className="flex flex-col gap-2">
                {/* <div className="p-10 flex flex-col gap-2 bg-blue-light rounded-lg mb-6">
                    <h2 className="text-2xl font-semibold">Toolkit</h2>
                    <p>Find tools that belong to patient groups on the Comend platform. Sign up with a researcher profile to request access to public tools, like biosamples, disease models, and clinical datasets.</p>
                </div> */}
                
                <h2 className="text-2xl semibold">Biosamples</h2>
                <ol className="w-full">
                    {(biosampleStore.searchResults && biosampleStore.searchResults.length > 0 )
                        ? (
                            <>
                                <div className="max-w-7xl w-full overflow-auto">
                                    <BiosamplesTable data={biosampleStore.searchResults?.slice(0, 3)} pageCount={1} columns={biosampleColumns} searchParams={{}}/>
                                </div>
                            </>
                        )
                        : (
                            <>
                                <Skeleton className="h-[286px] w-full"/>
                            </>
                        )
                    }
                </ol>
                <a href="/marketplace/biosamples" className="justify-self-end self-end underline">See all biosamples...</a>

                <h2 className="text-2xl semibold">Disease Models</h2>
                <ol className="w-full">
                    {(diseaseModelStore.searchResults && diseaseModelStore.searchResults.length > 0 )
                        ? (
                            <>
                                <div className="max-w-7xl w-full overflow-auto">
                                    <DiseaseModelsTable data={diseaseModelStore.searchResults?.slice(0, 3)} pageCount={1} columns={diseaseModelColumns} searchParams={{}}/>
                                </div>
                            </>
                        )
                        : (
                            <>
                                <Skeleton className="h-[286px] w-full"/>
                            </>
                        )
                    }
                </ol>
                <a href="/marketplace/disease-models" className="justify-self-end self-end underline">See all disease Models...</a>

                <h2 className="text-2xl semibold">Clinical Datasets</h2>
                <ol className="w-full">
                    {(clinicalDatasetStore.searchResults && clinicalDatasetStore.searchResults.length > 0 )
                        ? (
                            <>
                                <div className="max-w-7xl w-full overflow-auto">
                                    <ClinicalDatasetsTable data={clinicalDatasetStore.searchResults?.slice(0, 3)} pageCount={1} columns={clinicalDatasetColumns} searchParams={{}}/>
                                </div>
                            </>
                        )
                        : (
                            <>
                                <Skeleton className="h-[286px] w-full"/>
                            </>
                        )
                    }
                </ol>
                <a href="/marketplace/biosamples" className="justify-self-end self-end underline">See all biosamples...</a>
            </div>
        </main>
    )
}
