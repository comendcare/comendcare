"use client"

import { useBiosamplesTableColumns } from "@comend/components/biorepo/advanced-data-table/biosamples-table/public-biosamples-table-columns"
import { useClinicalDatasetsTableColumns } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/public-clinical-datasets-table-columns"
import { useDiseaseModelsTableColumns } from "@comend/components/biorepo/advanced-data-table/disease-models-table/public-disease-models-table-columns"
import { Button } from "@comend/components/ui/button"
import { Skeleton } from "@comend/components/ui/skeleton"
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore"
import { OrganizationSearchState, useOrganizationSearchStore } from "@/state/search/organizationSearchStore"
import { ArrowRight, X } from "lucide-react"
import Link from "next/link"
import {useEffect, useState} from "react"
import { useShallow } from "zustand/react/shallow"
import { CROMarketplaceCard } from "@comend/components/marketplace/marketplace-cro-card"
import { OrganizationMarketplaceCard } from "@comend/components/marketplace/marketplace-pag-card"
import { initializeCROSearch, initializeOrganizationSearch, initializeRFPSearch } from "@comend/lib/initialize-client-state"
import { RFPCard } from "@comend/components/rfp-card"
import { RFPSearchState, useRFPSearchStore } from "@/state/search/rfpSearchStore"
import { Dialog, DialogContent, DialogTrigger } from "@comend/components/ui/dialog"
import { mixpanelTrack } from "@comend/lib/mixpanel"
import { RFPDetails } from "@comend/components/pag-profile-rfps-card"
import { DatabaseBiosamplesTable } from "@comend/components/biorepo/advanced-data-table/biosamples-table/database-biosamples-table"
import { SearchParams } from "@comend/components/types"
import { DatabaseDiseaseModelsTable } from "@comend/components/biorepo/advanced-data-table/disease-models-table/database-disease-models-table"
import { DatabaseClinicalDatasetsTable } from "@comend/components/biorepo/advanced-data-table/clinical-datasets-table/database-clinical-datasets-table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@comend/components/ui/dropdown-menu"

const croSelector = (state: CROSearchState) => ({
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

const organizationSelector = (state: OrganizationSearchState) => ({
    featuredOrgs: state.featuredOrgs,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

const rfpSelector = (state: RFPSearchState) => ({
    initialized: state.initialized,
    setSearchTerm: state.setSearchTerm,
    searchResults: state.searchResults,
})

export default function MarketplaceExplorePage({
    isExternal,
    biosampleData,
    diseaseModelData,
    clinicalDatasetData,
    searchParams
}: {
    isExternal: boolean,
    biosampleData: any[],
    diseaseModelData: any[],
    clinicalDatasetData: any[]
    searchParams: SearchParams
}) {
    const croStore = useCROSearchStore(useShallow(croSelector))
    const organizationStore = useOrganizationSearchStore(useShallow(organizationSelector))
    const rfpStore = useRFPSearchStore(useShallow(rfpSelector))

    const biosampleColumns = useBiosamplesTableColumns(
        false, // disable sorting
        false, // disable hiding
        false // not typesense
    )
    const diseaseModelColumns = useDiseaseModelsTableColumns(
        false, // disable sorting,
        false, // disable hiding
        false, // not typesense
    )
    const clinicalDatasetColumns = useClinicalDatasetsTableColumns(
        false, // disable sorting,
        false, // disable hiding
        false, // not typesense
    )
    const [crosInitialized, setCROsInitialized] = useState(false)
    const [pagsInitialized, setPagsInitialized] = useState(false)
    const [rfpsInitialized, setRfpsInitialized] = useState(false)
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
                        Sign up to edit your profile, access the marketplace, and more.
                    </h1>
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
                        <div>
                            <h2 className="text-2xl semibold">Service providers</h2>
                            <p className="text-muted-foreground">Supporting 128 types of services</p>
                        </div>
                        {isExternal 
                            ? (<BrowseAllSignInButton />) 
                            : (
                                <Button asChild variant={"secondary"} className="justify-self-end self-end">
                                    <Link
                                        href={"/app/marketplace/service-providers"}
                                    >
                                        Browse all
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            )}
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
                                                // savedCompanyIds={savedCompanyIds}
                                                savedCompanyIds={new Set()}
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
                        <div>
                            <h2 className="text-2xl semibold">Patient groups</h2>
                            <p className="text-muted-foreground">Pursuing Y therapeutic pipelines</p>
                        </div>
                        {isExternal 
                            ? (<BrowseAllSignInButton />) 
                            : (
                                <Button asChild variant={"secondary"} className="justify-self-end self-end">
                                    <Link
                                        href={"/app/marketplace/patient-groups"}
                                    >
                                        Browse all
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            )}
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
                        <div>
                            <h2 className="text-2xl semibold">Patient biosamples</h2>
                            <p className="text-muted-foreground">Powering studies across Y conditions</p>
                        </div>
                        {isExternal 
                            ? (<BrowseAllSignInButton />) 
                            : (
                                <Button asChild variant={"secondary"} className="justify-self-end self-end">
                                    <Link
                                        href={"/app/marketplace/biosamples"}
                                    >
                                        Browse all patient biosamples
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            )}
                    </div>
                    <ol className="w-full">
                        <div className="max-w-7xl w-full overflow-auto">
                            <DatabaseBiosamplesTable 
                                data={biosampleData} 
                                pageCount={1} 
                                columns={biosampleColumns}
                                searchParams={searchParams}
                                showPagination={false}
                                showFilters={false}
                            />
                        </div>
                    </ol>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl semibold">Disease models</h2>
                            <p className="text-muted-foreground">Accelerating discovery across Y genes</p>
                        </div>
                        {isExternal 
                            ? (<BrowseAllSignInButton />) 
                            : (
                                <Button asChild variant={"secondary"} className="justify-self-end self-end">
                                    <Link
                                        href={"/app/marketplace/disease-models"}
                                    >
                                        Browse all disease models
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            )}
                    </div>
                    <ol className="w-full">
                        <div className="max-w-7xl w-full overflow-auto">
                            <DatabaseDiseaseModelsTable 
                                data={diseaseModelData} 
                                pageCount={1} 
                                columns={diseaseModelColumns}
                                searchParams={searchParams}
                                showPagination={false}
                                showFilters={false}
                            />
                        </div>
                    </ol>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl semibold">Clinical datasets</h2>
                            <p className="text-muted-foreground">Capturing progression for X patients</p>
                        </div>
                        {isExternal 
                            ? (<BrowseAllSignInButton />) 
                            : (
                                <Button asChild variant={"secondary"} className="justify-self-end self-end">
                                    <Link
                                        href={"/app/marketplace/clinical-datasets"}
                                    >
                                        Browse all clinical datasets
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            )}
                    </div>
                    <ol className="w-full">
                        <div className="max-w-7xl w-full overflow-auto">
                            <DatabaseClinicalDatasetsTable 
                                data={clinicalDatasetData} 
                                pageCount={1} 
                                columns={clinicalDatasetColumns}
                                searchParams={searchParams}
                                showPagination={false}
                                showFilters={false}
                            />
                        </div>
                    </ol>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center gap-4">
                        <div>
                            <h2 className="text-2xl semibold">Requests for proposals</h2>
                            <p className="text-muted-foreground">Across $Y in active budgets</p>
                        </div>
                        {isExternal 
                            ? (<BrowseAllSignInButton />) 
                            : (
                                <Button asChild variant={"secondary"} className="justify-self-end self-end">
                                    <Link
                                        href={"/app/marketplace/rfps"}
                                    >
                                        Browse all requests for proposals
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            )}
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
            </div>
        </div>
    )
}
