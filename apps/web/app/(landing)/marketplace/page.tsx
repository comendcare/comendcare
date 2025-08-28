"use client"

import { BiosamplesTable } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table"
import { useBiosamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns"
import { ClinicalDatasetsTable } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table"
import { useClinicalDatasetsTableColumns } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns"
import { DiseaseModelsTable } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table"
import { useDiseaseModelsTableColumns } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns"
import { Button } from "@/packages/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/packages/components/ui/card"
import { Separator } from "@/packages/components/ui/separator"
import { Skeleton } from "@/packages/components/ui/skeleton"
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore"
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore"
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore"
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
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
        <main className="w-full h-full flex flex-col gap-10">
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-semibold">Patient Groups</h2>
                    <Button asChild variant={"cta"} className="justify-self-end self-end">
                        <Link
                            href={"/marketplace/patient-groups"}
                        >
                            Browse all patient groups
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
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
            </div>
    
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-semibold">Biosamples</h2>
                    <Button asChild variant={"cta"} className="justify-self-end self-end">
                        <Link
                            href={"/marketplace/biosamples"}
                        >
                            Browse all biosamples
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
                <ol className="w-full">
                    {(biosampleStore.searchResults && biosampleStore.searchResults.length > 0 )
                        ? (
                            <>
                                <div className="max-w-7xl w-full overflow-auto">
                                    <BiosamplesTable showPagination={false} data={biosampleStore.searchResults?.slice(0, 3)} pageCount={1} columns={biosampleColumns} searchParams={{}}/>
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
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-semibold">Disease Models</h2>
                    <Button asChild variant={"cta"} className="justify-self-end self-end">
                        <Link
                            href={"/marketplace/disease-models"}
                        >
                            Browse all disease models
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
                <ol className="w-full">
                    {(diseaseModelStore.searchResults && diseaseModelStore.searchResults.length > 0 )
                        ? (
                            <>
                                <div className="max-w-7xl w-full overflow-auto">
                                    <DiseaseModelsTable showPagination={false} data={diseaseModelStore.searchResults?.slice(0, 3)} pageCount={1} columns={diseaseModelColumns} searchParams={{}}/>
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
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-semibold">Clinical Datasets</h2>
                    <Button asChild variant={"cta"} className="justify-self-end self-end">
                        <Link
                            href={"/marketplace/clinical-datasets"}
                        >
                            Browse all clinical datasets
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
                <ol className="w-full">
                    {(clinicalDatasetStore.searchResults && clinicalDatasetStore.searchResults.length > 0 )
                        ? (
                            <>
                                <div className="max-w-7xl w-full overflow-auto">
                                    <ClinicalDatasetsTable showPagination={false} data={clinicalDatasetStore.searchResults?.slice(0, 3)} pageCount={1} columns={clinicalDatasetColumns} searchParams={{}}/>
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
            </div>
        </main>
    )
}
