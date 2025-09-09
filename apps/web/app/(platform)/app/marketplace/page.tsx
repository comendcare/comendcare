"use client"

import { BiosamplesTable } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table"
import { useBiosamplesTableColumns } from "@/packages/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns"
import { ClinicalDatasetsTable } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table"
import { useClinicalDatasetsTableColumns } from "@/packages/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns"
import { DiseaseModelsTable } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table"
import { useDiseaseModelsTableColumns } from "@/packages/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns"
import { Button } from "@/packages/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/packages/components/ui/card"
import { PulsatingButton } from "@/packages/components/ui/pulsating-button"
import { Skeleton } from "@/packages/components/ui/skeleton"
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore"
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore"
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore"
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore"
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"
import { CROMarketplaceCard } from "~web/components/marketplace/marketplace-cro-card"
import { OrganizationMarketplaceCard } from "~web/components/marketplace/marketplace-pag-card"
import { OrganizationMarketplaceListElement } from "~web/components/marketplace/marketplace-pag-list-element"

const croSelector = (state: CROSearchState) => ({
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

const organizationSelector = (state: OrganizationSearchState) => ({
    featuredOrgs: state.featuredOrgs,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

const biosampleSelector = (state: BiosampleSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

const diseaseModelSelector = (state: DiseaseModelSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

const clinicalDatsetSelector = (state: ClinicalDatasetSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

export default function MarketplacePage() {
    const croStore = useCROSearchStore(useShallow(croSelector))
    const organizationStore = useOrganizationSearchStore(useShallow(organizationSelector))
    const biosampleStore = useBiosampleSearchStore(useShallow(biosampleSelector))
    const diseaseModelStore = useDiseaseModelSearchStore(useShallow(diseaseModelSelector))
    const clinicalDatasetStore = useClinicalDatasetSearchStore(useShallow(clinicalDatsetSelector))
    const biosampleColumns = useBiosamplesTableColumns()
    const diseaseModelColumns = useDiseaseModelsTableColumns()
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns()

    useEffect(() => {
        croStore.setSearchTerm("")
        organizationStore.setSearchTerm("")
        biosampleStore.setSearchTerm("")
        diseaseModelStore.setSearchTerm("")
        clinicalDatasetStore.setSearchTerm("")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    return (
        <div className="flex flex-col w-full px-4 h-full mx-auto gap-8">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-2xl semibold">Service Providers</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/app/marketplace/service-providers"}
                            >
                                Browse all service providers
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                    <ol className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(croStore.searchResults && croStore.searchResults.length > 0 )
                            ? (
                                <>
                                    {croStore.searchResults?.slice(0, 3).map((cro, index) => (
                                        <CROMarketplaceCard cro={cro} key={index} location={"Marketplace"}/>
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
                        <h2 className="text-2xl semibold">Patient Groups</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/app/marketplace/patient-groups"}
                            >
                                Browse all patient groups
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                    <ol className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {([...(organizationStore.featuredOrgs || []), ...(organizationStore.searchResults || [])].length > 0 )
                            ? (
                                <>
                                    {[...(organizationStore.featuredOrgs || []), ...(organizationStore.searchResults || [])].slice(0, 3).map((organization, index) => (
                                        <OrganizationMarketplaceCard organization={organization} key={index} isPublic={false} />
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

                {/* <div className="p-10 flex flex-col gap-2 bg-blue-light rounded-lg mb-6">
                    <h2 className="text-2xl font-semibold">Toolkit</h2>
                    <p>Find tools that belong to patient groups on the Comend platform. Sign up with a researcher profile to request access to public tools, like biosamples, disease models, and clinical datasets.</p>
                </div> */}
        
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-2xl semibold">Biosamples</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/app/marketplace/biosamples"}
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
                                biosampleStore.initialized 
                                    ? (
                                        <Card className="h-[286px] w-full">
                                            <CardContent className="h-full w-full flex flex-col justify-center items-center text-center gap-4">
                                                <CardTitle>Add biosamples in the toolkit!</CardTitle>
                                                {/* <CardDescription>Add biosamples in the toolkit tab, and mark them as published to view them in the marketplace.</CardDescription> */}
                                                <Button
                                                    className="w-fit"
                                                    variant={'secondary'}
                                                    asChild
                                                >
                                                    {/* <Link href={"/#contact"}> */}
                                                    <Link href={"/app/tools/biosample"}>
                                                        Biosamples Toolkit
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                    : (
                                        <>
                                            <Skeleton className="h-[286px] w-full"/>
                                        </>
                                    )
                            )
                        }
                    </ol>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-2xl semibold">Disease Models</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/app/marketplace/disease-models"}
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
                                diseaseModelStore.initialized 
                                    ? (
                                        <Card className="h-[286px] w-full">
                                            <CardContent className="h-full w-full flex flex-col justify-center items-center text-center gap-4">
                                                <CardTitle>Add disease models in the toolkit!</CardTitle>
                                                {/* <CardDescription>Add disease models in the toolkit tab, and mark them as published to view them in the marketplace.</CardDescription> */}
                                                <Button
                                                    className="w-fit"
                                                    variant={'secondary'}
                                                    asChild
                                                >
                                                    {/* <Link href={"/#contact"}> */}
                                                    <Link href={"/app/tools/disease-models"}>
                                                        Disease Models Toolkit
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                    : (
                                        <>
                                            <Skeleton className="h-[286px] w-full"/>
                                        </>
                                    )
                            )
                        }
                    </ol>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-2xl semibold">Clinical Datasets</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/app/marketplace/clinical-datasets"}
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
                                clinicalDatasetStore.initialized 
                                    ? (
                                        <Card className="h-[286px] w-full">
                                            <CardContent className="h-full w-full flex flex-col justify-center items-center text-center gap-4">
                                                <CardTitle>Add clinical dataset in the toolkit!</CardTitle>
                                                {/* <CardDescription>Add clinical datasets in the toolkit tab, and mark them as published to view them in the marketplace.</CardDescription> */}
                                                <Button
                                                    className="w-fit"
                                                    variant={'secondary'}
                                                    asChild
                                                >
                                                    {/* <Link href={"/#contact"}> */}
                                                    <Link href={"/app/tools/data"}>
                                                        Clinical Datasets Toolkit
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )
                                    : (
                                        <>
                                            <Skeleton className="h-[286px] w-full"/>
                                        </>
                                    )
                            )
                        }
                    </ol>
                </div>
            </div>
        </div>
    )
}
