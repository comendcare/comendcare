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
import { DiseaseModelSearchState, useDiseaseModelSearchStore } from "@/state/search/diseaseModelSearchStore"
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { ArrowRight, X } from "lucide-react"
import Link from "next/link"
import {useEffect, useState} from "react"
import { useShallow } from "zustand/react/shallow"
import { OrganizationMarketplaceCard } from "@comend/components/marketplace/marketplace-pag-card"
import { initializeBiosampleSearch, initializeClinicalDatasetSearch, initializeCROSearch, initializeDiseaseModelSearch, initializeOrganizationSearch, initializeRFPSearch } from "@comend/lib/initialize-client-state"
import { RFPSearchState, useRFPSearchStore } from "@/state/search/rfpSearchStore"
import { RFPCard } from "@comend/components/rfp-card"
import { mixpanelTrack } from "@comend/lib/mixpanel"
import { Dialog, DialogContent, DialogTrigger } from "@comend/components/ui/dialog"
import { RFPDetails } from "@comend/components/pag-profile-rfps-card"
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore"
import { CROMarketplaceCard } from "@comend/components/marketplace/marketplace-cro-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@comend/components/ui/dropdown-menu"

const croSelector = (state: CROSearchState) => ({
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults,
})

const organizationSelector = (state: OrganizationSearchState) => ({
    featuredOrgs: state.featuredOrgs,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults,
})

const biosampleSelector = (state: BiosampleSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults,
})

const diseaseModelSelector = (state: DiseaseModelSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults,
})

const clinicalDatsetSelector = (state: ClinicalDatasetSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults,
})

const rfpSelector = (state: RFPSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
    totalResults: state.totalResults,
})

export default function MarketplacePage() {
    // const {data: session, status} = useSession()
    const croStore = useCROSearchStore(useShallow(croSelector))
    const organizationStore = useOrganizationSearchStore(useShallow(organizationSelector))
    const biosampleStore = useBiosampleSearchStore(useShallow(biosampleSelector))
    const diseaseModelStore = useDiseaseModelSearchStore(useShallow(diseaseModelSelector))
    const clinicalDatasetStore = useClinicalDatasetSearchStore(useShallow(clinicalDatsetSelector))
    const rfpStore = useRFPSearchStore(useShallow(rfpSelector))

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
    const [crosInitialized, setCROsInitialized] = useState(false)
    const [pagsInitialized, setPagsInitialized] = useState(false)
    const [biosamplesInitialized, setBiosamplesInitialized] = useState(false)
    const [diseaseModelsInitialized, setDiseaseModelsInitialized] = useState(false)
    const [clinicalDatasetsInitialized, setClinicalDatasetsInitialized] = useState(false)
    const [rfpsInitialized, setRfpsInitialized] = useState(false)
    const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0)

    useEffect(() => {
        const init = async () => {
            console.log(`start init...`)
            const parsedCROFilters = {
                categories: [] as any[],
                milestoneTypes: [] as any[],
                types: [] as any[],
                certifications: [] as any[],
                tags: [] as any[],
            }
            await initializeCROSearch(parsedCROFilters)
            setCROsInitialized(true)
            console.log(`CRO search initialized...`)

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
        }

        init()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        function handleResize() {
            setWidth(window.innerWidth)
        }

        window.addEventListener('resize', handleResize)
        handleResize() // Set initial width on mount

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const BrowseAllSignInButton = () => {
        const [isOpen, setIsOpen] = useState(false)

        return (
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="secondary"
                        className="justify-self-end self-end"
                    >
                        Browse all
                        <ArrowRight />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="border-2 w-96 p-4 flex-col space-y-4"
                >
                    <button
                        className="absolute top-0 right-0 p-2 m-2"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-4 w-4"/>
                    </button>
                    <h1 className="mx-auto text-center">
                        Sign up to create a profile, access our marketplace, and more.                    </h1>
                    <div className="flex flex-col gap-2">
                        <Link
                            href={
                                process.env.NEXT_PUBLIC_NODE_ENV === "production"
                                    ? "https://researcher.comend.io/login"
                                    : `http://researcher.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`
                            }
                            className="w-full"
                        >
                            <Button
                                variant="cta"
                                className="w-full justify-center"
                            >
                                Researcher Log in
                            </Button>
                        </Link>

                        <Link
                            href={
                                process.env.NEXT_PUBLIC_NODE_ENV === "production"
                                    ? "https://comend.io/login"
                                    : `http://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/login`
                            }
                            className="w-full"
                        >
                            <Button
                                variant="cta"
                                className="w-full justify-center"
                            >
                                Patient Group Log in
                            </Button>
                        </Link>

                        <Link
                            href="https://calendly.com/albertatcomend/onboarding"
                            className="w-full"
                            target="_blank"
                        >
                            <Button
                                variant="outline"
                                className="w-full justify-center"
                            >
                                Patient Group Sign up
                            </Button>
                        </Link>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <div className="flex flex-col w-full h-full mx-auto gap-8">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-md font-semibold md:font-normal md:text-2xl semibold">{
                            crosInitialized 
                                ? `Service providers (${croStore.totalResults})`
                                : `Service providers`
                        }</h2>
                        <BrowseAllSignInButton />
                    </div>
                    <ol className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(crosInitialized && croStore.searchResults && croStore.searchResults.length > 0 )
                            ? (
                                <>
                                    {croStore.searchResults?.slice(0, width < 1280 ? 2 : 3)
                                        .map((cro, index) => (
                                            <CROMarketplaceCard
                                                cro={cro}
                                                key={index}
                                                location={"Marketplace"}
                                                savedCompanyIds={new Set()}
                                                disabled={true}
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
                        <h2 className="text-md font-semibold md:font-normal md:text-2xl semibold">{
                            pagsInitialized 
                                ? `Patient groups (${organizationStore.totalResults})`
                                : `Patient groups`
                        }</h2>
                        <BrowseAllSignInButton />
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
                                                // savedOrganizationIds={savedOrganizationIds}
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
                        <h2 className="text-md font-semibold md:font-normal md:text-2xl semibold">{
                            biosamplesInitialized 
                                ? `Patient biosamples (${biosampleStore.totalResults})`
                                : `Patient biosamples`
                        }</h2>
                        <BrowseAllSignInButton />
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
                        <h2 className="text-md font-semibold md:font-normal md:text-2xl semibold">{
                            diseaseModelsInitialized 
                                ? `Disease models (${diseaseModelStore.totalResults})`
                                : `Disease models`
                        }</h2>
                        <BrowseAllSignInButton />
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
                        <h2 className="text-md font-semibold md:font-normal md:text-2xl semibold">{
                            clinicalDatasetsInitialized 
                                ? `Clinical datasets (${clinicalDatasetStore.totalResults})`
                                : `Clinical datasets`
                        }</h2>
                        <BrowseAllSignInButton />
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

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="text-md font-semibold md:font-normal md:text-2xl semibold">{
                            rfpsInitialized 
                                ? `Requests for proposals (${rfpStore.totalResults})`
                                : `Requests for proposals`
                        }</h2>
                        <BrowseAllSignInButton />
                    </div>
                    <ol className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(rfpsInitialized && rfpStore.searchResults && rfpStore.searchResults.length > 0 )
                            ? (
                                <>
                                    {rfpStore.searchResults?.slice(0, 3).map((rfp, index) => (
                                        <Dialog key={index}>
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
            </div>
        </div>
    )
}
