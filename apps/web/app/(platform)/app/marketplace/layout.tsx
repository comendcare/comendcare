"use client"
import {MarketplaceNav} from "@/components/marketplace-nav"
import {MilestoneFilters} from "@/components/milestone-filters"
import {PAGFilters} from "@/components/pag-filters"
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable"
import {useFiltersStore} from "@/state/nav/navStore"
import {usePathname} from "next/navigation"
import {useEffect, useState} from "react";
import {Organization} from "@prisma/client";
import {getMilestoneTypes, getPublicOrganizationData} from "@/lib/fetchers";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import Image from "next/image"
import {CROFilters} from "@/components/cro-filters";
import { useQueryState } from "nuqs"
import { initializeCROSearch, initializeOrganizationSearch } from "@/lib/initialize-client-state"
import { ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS } from "@/lib/types"

// export const metadata: Metadata = {
//     title: "Comend",
//     description: "Check out some examples app built using the components."
// }

const parseQuery = (str: string | null) =>
    str?.split(",").filter(Boolean).map((value) => ({ label: value, value })) || []

interface ProjectLayoutProps {
    children: React.ReactNode
}

export default function ProjectLayout({children}: ProjectLayoutProps) {
    // Zustand state management
    const {data: session} = useSession()
    const {defaultLayout, setLayout} = useFiltersStore()
    // const [organization, setOrganization] = useState<Organization | null>();

    const [queryMilestoneTypes, setQueryMilestoneTypes] = useQueryState("milestoneTypes", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })

    const [queryCategories, setQueryCategories] = useQueryState("categories", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })

    const [queryTypes, setQueryTypes] = useQueryState("types", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })

    const [queryCertifications, setQueryCertifications] = useQueryState("certifications", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })

    const [queryTags, setQueryTags] = useQueryState("tags", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })

    const [querySystems, setQuerySystems] = useQueryState("systems", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })
    const [queryMechanisms, setQueryMechanisms] = useQueryState("mechanisms", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })
    const [queryModalities, setQueryModalities] = useQueryState("modalities", {
        shallow: true,
        history: "replace",
        clearOnDefault: true,
    })

    const handleSessionUpdate = async () => {
        // init CRO Search store
        const milestoneTypes = await getMilestoneTypes({
            id: true,
            label: true,
            services: true,
            categories: true,
            description: true
        })
        const parsedCROFilters = {
            categories: parseQuery(queryCategories),
            milestoneTypes: parseQuery(queryMilestoneTypes)
                .map(query => {
                    const milestoneType = (milestoneTypes.data || []).find(milestone => milestone.id === query.value)
                    if (!milestoneType) return undefined
                    return {
                        label: milestoneType.label,
                        value: milestoneType.id
                    }
                })
                .filter(query => query !== undefined),
            types: parseQuery(queryTypes),
            certifications: parseQuery(queryCertifications),
            tags: parseQuery(queryTags),
        }
        initializeCROSearch(parsedCROFilters)
        console.log(`CRO search initialized...`)

        // init organization/PAG search store
        const parsedPAGFilters = {
            systems: parseQuery(querySystems).map(query => {
                const system = (ASSOCIATED_SYSTEMS || []).find(system => system.value === query.value)
                if (!system) return undefined
                return system
            }).filter(query => query !== undefined),
            mechanisms: parseQuery(queryMechanisms).map(query => {
                const mechanism = (MOLECULAR_MECHANISMS || []).find(mechanism => mechanism.value === query.value)
                if (!mechanism) return undefined
                return mechanism
            }).filter(query => query !== undefined),
            modalities: parseQuery(queryModalities).map(query => {
                const modality = (MODALITIES || []).find(modalities => modalities.value === query.value)
                if (!modality) return undefined
                return modality
            }).filter(query => query !== undefined),
        }
        initializeOrganizationSearch(parsedPAGFilters)
        console.log(`Organization search initialized...`)
    }

    useEffect(() => {
        // session?.user?.organizationId ? getPublicOrganizationData(session.user?.organizationId, {
        //     id: true,
        //     published: true,
        //     verified: true,
        //     public: true,
        //     name: true,
        //     description: true,
        //     contactEmail: true,
        //     image: true,
        //     headerImage: true,
        //     subdomain: true,
        //     yearFounded: true,
        //     incorporationStatus: true,
        //     therapeuticsOfInterest: true,
        //     therapeuticsInDevelopment: true,
        //     website: true,
        //     moneyRaised: true,
        //     moneyDeployed: true,
        //     researchBudget: true,
        //     members: true,
        //     conditions: true,
        // }).then((response) => {
        //     if (response.success) {
        //         const organization = response.data
        //         setOrganization(organization)
        //     } else {
        //         console.error(response.error)
        //         toast.error(response.error)
        //     }
        // }) : toast.error("No organizationId provided")

        handleSessionUpdate()
        
    }, [session?.user?.organizationId]);

    // if (organization && !organization?.published) {
    //     return <div className="h-full flex flex-col mx-auto items-center justify-center py-20">
    //         <Image
    //             alt="Organization not published"
    //             src="https://illustrations.popsy.co/gray/meditation-girl.svg"
    //             width={400}
    //             height={400}
    //             className="dark:hidden"
    //         />
    //         <Image
    //             alt="Organization not published"
    //             src="https://illustrations.popsy.co/white/meditation-girl.svg"
    //             width={400}
    //             height={400}
    //             className="hidden dark:block"
    //         />
    //         <p className="text-center font-title text-2xl text-stone-600 dark:text-stone-400">
    //             {`Your organization isn't published yet.`}
    //         </p>
    //         <p className="text-center mt-4 text-stone-500 dark:text-stone-300 max-w-xl">
    //             {`To access the marketplace you need to publish your organization. Only published organizations can view and be shown in the marketplace.`}
    //         </p>
    //     </div>
    // }

    return (
        <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes: number[]) => {
                setLayout(sizes) // Use Zustand's setLayout to save panel sizes
            }}
            className="h-full items-stretch"
        >
            <ResizablePanel defaultSize={defaultLayout[0]} minSize={30}
                            className="container relative flex flex-col items-center">
                <MarketplaceNav projectId=""/>
                {children}
            </ResizablePanel>

            <>
                <ResizableHandle withHandle/>

                <ResizablePanel
                    defaultSize={defaultLayout[1]}
                    minSize={15}
                    maxSize={30}
                    className="bg-white p-8 flex flex-col gap-4"
                >
                    <FiltersPanel/>
                </ResizablePanel>
            </>
        </ResizablePanelGroup>
    )
}

const FiltersPanel = () => {
    const pathname = usePathname()

    if (pathname.endsWith('/milestones')) {
        return <MilestoneFilters/>
    } else if (pathname.endsWith('/service-providers')){
        return <CROFilters/>
    } else {
        return <PAGFilters/>
    }
}
