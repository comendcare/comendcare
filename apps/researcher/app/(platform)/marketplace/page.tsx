"use client"

import { TypesenseBiosamplesTable } from "@comend/components/biorepo/advanced-data-table/biosamples-table/typesense-biosamples-table"
import { useBiosamplesTableColumns } from "@comend/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns"
import { TypesenseClinicalDatasetsTable } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/typesense-clinical-datasets-table"
import { useClinicalDatasetsTableColumns } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns"
import { TypesenseDiseaseModelsTable } from "@comend/components/biorepo/advanced-data-table/disease-models-table/typesense-disease-models-table"
import { useDiseaseModelsTableColumns } from "@comend/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns"
import { Button } from "@comend/components/ui/button"
import { Card, CardContent, CardTitle } from "@comend/components/ui/card"
import { Skeleton } from "@comend/components/ui/skeleton"
import { BiosampleSearchState, useBiosampleSearchStore } from "@/state/search/biosampleSearchStore"
import { ClinicalDatasetSearchState, useClinicalDatasetSearchStore } from "@/state/search/clinicalDatasetSearchStore"
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore"
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore"
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import {useEffect, useState} from "react"
import { useShallow } from "zustand/react/shallow"
import { CROMarketplaceCard } from "@comend/components/marketplace/marketplace-cro-card"
import { OrganizationMarketplaceCard } from "@comend/components/marketplace/marketplace-pag-card"
import { initializeBiosampleSearch, initializeClinicalDatasetSearch, initializeCROSearch, initializeDiseaseModelSearch, initializeOrganizationSearch, initializeResearcherSearch, initializeRFPSearch } from "@comend/lib/initialize-client-state"
import { RFPCard } from "@comend/components/rfp-card"
import { RFPSearchState, useRFPSearchStore } from "@/state/search/rfpSearchStore"
import { Dialog, DialogContent, DialogTrigger } from "@comend/components/ui/dialog"
import { mixpanelTrack } from "@comend/lib/mixpanel"
import { RFPDetails } from "@comend/components/pag-profile-rfps-card"
import { formatMoney } from "@comend/lib/utils"
import { ResearcherSearchState, useResearcherSearchStore } from "@/state/search/researcherSearchStore"
import { ResearcherCard } from "@comend/components/researcher-card"

const organizationSelector = (state: OrganizationSearchState) => ({
    featuredOrgs: state.featuredOrgs,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults
})

const biosampleSelector = (state: BiosampleSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults
})

const diseaseModelSelector = (state: DiseaseModelSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults
})

const clinicalDatsetSelector = (state: ClinicalDatasetSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults
})

const rfpSelector = (state: RFPSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults
})

const researcherSelector = (state: ResearcherSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults
})

export default function MarketplacePage() {
    const organizationStore = useOrganizationSearchStore(useShallow(organizationSelector))
    const biosampleStore = useBiosampleSearchStore(useShallow(biosampleSelector))
    const diseaseModelStore = useDiseaseModelSearchStore(useShallow(diseaseModelSelector))
    const clinicalDatasetStore = useClinicalDatasetSearchStore(useShallow(clinicalDatsetSelector))
    const rfpStore = useRFPSearchStore(useShallow(rfpSelector))
    const researcherStore = useResearcherSearchStore(useShallow(researcherSelector))

    const biosampleColumns = useBiosamplesTableColumns(
        false, // disable sorting
        false, // disable hiding
    )
    const diseaseModelColumns = useDiseaseModelsTableColumns(
        false, // disable sorting,
        false, // disable hiding
    )
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns(
        false, // disable sorting,
        false, // disable hiding
    )
    const [pagsInitialized, setPagsInitialized] = useState(false)
    const [biosamplesInitialized, setBiosamplesInitialized] = useState(false)
    const [diseaseModelsInitialized, setDiseaseModelsInitialized] = useState(false)
    const [clinicalDatasetsInitialized, setClinicalDatasetsInitialized] = useState(false)
    const [rfpsInitialized, setRfpsInitialized] = useState(false)
    const [researchersInitialized, setResearchersInitialized] = useState(false)
    const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth)
        }

        window.addEventListener('resize', handleResize)
        handleResize() // Set initial width on mount

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const init = async () => {
            console.log(`start init...`)

            const parsedPAGFilters = {
                genes: [] as any[],
                conditions: [] as any[],
                systems: [] as any[],
                mechanisms: [] as any[],
                modalities: [] as any[],
            }
            await initializeOrganizationSearch(parsedPAGFilters)
            setPagsInitialized(true)
            console.log(`Organization search initialized...`)

            const parsedBiosampleFilters = {
                types: [] as any[],
                genes: [] as any[],
                conditions: [] as any[],
                organizations: [] as any[],
            }
            await initializeBiosampleSearch(parsedBiosampleFilters)
            setBiosamplesInitialized(true)
            console.log(`Biosample search initialized...`)

            const parsedDiseaseModelFilters = {
                types: [] as any[],
                genes: [] as any[],
                conditions: [] as any[],
                organizations: [] as any[],
            }
            await initializeDiseaseModelSearch(parsedDiseaseModelFilters)
            setDiseaseModelsInitialized(true)
            console.log(`Disease Model search initialized...`)

            const parsedClinicalDatasetFilters = {
                types: [] as any[],
                genes: [] as any[],
                conditions: [] as any[],
                organizations: [] as any[]
            }
            await initializeClinicalDatasetSearch(parsedClinicalDatasetFilters)
            setClinicalDatasetsInitialized(true)
            console.log(`Clinical Dataset search initialized...`)

            const parsedRFPFilters = {
                conditions: [],
                genes: [],
                openTo: [],
                status: [],
                organizations: []
            }
            initializeRFPSearch(parsedRFPFilters)
            setRfpsInitialized(true)
            console.log(`RFP search initialized...`)

            const parsedResearcherFilters = {
                researchInterests: [],
                therapeuticsOfInterest: [],
                conditionsOfInterest: [],
                genes: [],
            }
            initializeResearcherSearch(parsedResearcherFilters)
            setResearchersInitialized(true)
            console.log(`RFP search initialized...`)
        }

        init()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="max-w-7xl flex flex-col w-full h-full mx-auto gap-8 py-8">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-2xl semibold">Patient groups</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/marketplace/patient-groups"}
                            >
                                {(organizationStore.totalResults && organizationStore.totalResults > 0 )? (`Browse all ${formatMoney(organizationStore.totalResults)}`) : (`Browse all`)}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                    <ol className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(pagsInitialized && ([...(organizationStore.featuredOrgs || []), ...(organizationStore.searchResults || [])].length > 0))
                            ? (
                                <>
                                    {[...(organizationStore.featuredOrgs || []), ...(organizationStore.searchResults || [])]
                                        .slice(0, width < 1280 ? 2 : 3)
                                        .map((organization, index) => (
                                            <OrganizationMarketplaceCard
                                                organization={organization}
                                                key={index}
                                                isPublic={false}
                                                savedOrganizationIds={new Set()}
                                            />
                                    ))}
                                </>
                            )
                            : (
                                <>
                                    <Skeleton className="h-[286px] w-full"/>
                                    <Skeleton className="h-[286px] w-full"/>
                                    {width > 1280 && <Skeleton className="h-[286px] w-full"/>}
                                </>
                            )
                        }
                    </ol>
                </div>
        
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-2xl semibold">Patient biosamples</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/marketplace/biosamples"}
                            >
                                {(biosampleStore.totalResults && biosampleStore.totalResults > 0 )? (`Browse all ${formatMoney(biosampleStore.totalResults)}`) : (`Browse all`)}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                    <ol className="w-full">
                        {(biosamplesInitialized && biosampleStore.searchResults && biosampleStore.searchResults.length > 0 )
                            ? (
                                <>
                                    <div className="max-w-7xl w-full overflow-auto">
                                        <TypesenseBiosamplesTable 
                                            showPagination={false} 
                                            data={biosampleStore.searchResults?.slice(0, 3)} 
                                            pageCount={1} 
                                            columns={biosampleColumns} 
                                            searchParams={{}}
                                        />
                                    </div>
                                </>
                            )
                            : (
                                (biosamplesInitialized && biosampleStore.initialized )
                                    ? (
                                        <Card className="h-[286px] w-full">
                                            <CardContent className="h-full w-full flex flex-col justify-center items-center text-center gap-4">
                                                <CardTitle>Add patient biosamples in the toolkit!</CardTitle>
                                                {/* <CardDescription>Add biosamples in the toolkit tab, and mark them as published to view them in the marketplace.</CardDescription> */}
                                                <Button
                                                    className="w-fit"
                                                    variant={'secondary'}
                                                    asChild
                                                >
                                                    {/* <Link href={"/#contact"}> */}
                                                    <Link href={"/app/tools/biosample"}>
                                                        Patient biosamples toolkit
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
                        <h2 className="text-2xl semibold">Disease models</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/marketplace/disease-models"}
                            >
                                {(diseaseModelStore.totalResults && diseaseModelStore.totalResults > 0 )? (`Browse all ${formatMoney(diseaseModelStore.totalResults)}`) : (`Browse all`)}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                    <ol className="w-full">
                        {(diseaseModelsInitialized && diseaseModelStore.searchResults && diseaseModelStore.searchResults.length > 0 )
                            ? (
                                <>
                                    <div className="max-w-7xl w-full overflow-auto">
                                        <TypesenseDiseaseModelsTable showPagination={false} data={diseaseModelStore.searchResults?.slice(0, 3)} pageCount={1} columns={diseaseModelColumns} searchParams={{}}/>
                                    </div>
                                </>
                            )
                            : (
                                (diseaseModelsInitialized && diseaseModelStore.initialized) 
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
                                                        Disease models toolkit
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
                        <h2 className="text-2xl semibold">Clinical datasets</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/marketplace/clinical-datasets"}
                            >
                                {(clinicalDatasetStore.totalResults && clinicalDatasetStore.totalResults > 0 )? (`Browse all ${formatMoney(clinicalDatasetStore.totalResults)}`) : (`Browse all`)}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                    <ol className="w-full">
                        {(clinicalDatasetsInitialized && clinicalDatasetStore.searchResults && clinicalDatasetStore.searchResults.length > 0 )
                            ? (
                                <>
                                    <div className="max-w-7xl w-full overflow-auto">
                                        <TypesenseClinicalDatasetsTable showPagination={false} data={clinicalDatasetStore.searchResults?.slice(0, 3)} pageCount={1} columns={clinicalDatasetColumns} searchParams={{}}/>
                                    </div>
                                </>
                            )
                            : (
                                (clinicalDatasetsInitialized && clinicalDatasetStore.initialized)
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
                                                        Clinical datasets toolkit
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
                        <h2 className="text-2xl semibold">Requests for proposals</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/marketplace/rfps"}
                            >
                                {(rfpStore.totalResults && rfpStore.totalResults > 0 )? (`Browse all ${formatMoney(rfpStore.totalResults)}`) : (`Browse all`)}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                    <ol className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(rfpsInitialized && rfpStore.searchResults && rfpStore.searchResults.length > 0 )
                            ? (
                                <>
                                    {rfpStore.searchResults?.slice(0, 3).map((rfp, index) => (
                                        <Dialog>
                                            <DialogTrigger
                                                className="w-full max-w-full h-full"
                                                onClick={() => {
                                                    mixpanelTrack("RFP Details Viewed", {
                                                        "ID": rfp.id,
                                                        "Name": rfp.title,
                                                        "Budget": rfp.budget,
                                                        "Linked Projects": rfp.milestones.map(({milestone}: any) => milestone),
                                                        // NOTE: Mixpanel doesn't support parsing nested objects, so in order to access types properly
                                                        // we flatten them into a single list that can be parsed
                                                        "Linked Project Types": rfp.milestones.flatMap(({milestone}: any) =>
                                                            (milestone?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id)
                                                        ),
                                                        "Location": "marketplace explore"
                                                    })
                                                }}
                                                data-testid="rfp-card-trigger"
                                            >
                                                <RFPCard rfp={rfp} showOrganization={true}/>
                                            </DialogTrigger>
                                            <DialogContent className="overflow-hidden" data-testid="dialog">
                                                <RFPDetails rfp={rfp}/>
                                            </DialogContent>
                                        </Dialog>
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
                        <h2 className="text-2xl semibold">Researchers</h2>
                        <Button asChild variant={"secondary"} className="justify-self-end self-end">
                            <Link
                                href={"/marketplace/researchers"}
                            >
                                {(researcherStore.totalResults && researcherStore.totalResults > 0 )? (`Browse all ${formatMoney(researcherStore.totalResults)}`) : (`Browse all`)}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                    <ol className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(researchersInitialized && researcherStore.searchResults && researcherStore.searchResults.length > 0 )
                            ? (
                                <>
                                    {researcherStore.searchResults?.slice(0, 3).map((researcher, index) => (
                                        <Link
                                            href={
                                                process.env.NEXT_PUBLIC_VERCEL_ENV
                                                    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/researcher/${researcher.user.id}`
                                                    : `http://localhost:3000/researcher/${researcher.user.id}`
                                            }
                                            className="flex flex-row gap-4 items-center"
                                        >
                                            <ResearcherCard researcher={researcher} />
                                        </Link>
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
            </div>
        </div>
    )
}
