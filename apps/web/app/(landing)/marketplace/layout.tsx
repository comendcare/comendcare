"use client"
import {PublicMarketplaceNav} from "~web/components/marketplace/marketplace-nav"
import {useFiltersStore} from "@/state/nav/navStore"
import {usePathname} from "next/navigation"
import {useEffect, useState} from "react";
import {getMilestoneTypes, getPublicOrganizationData} from "@comend/lib/fetchers";
import {useSession} from "next-auth/react";
import { useQueryState } from "nuqs"
import { initializeBiosampleSearch, initializeClinicalDatasetSearch, initializeCROSearch, initializeDiseaseModelSearch, initializeOrganizationSearch } from "@comend/lib/initialize-client-state"
import { ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS } from "@comend/lib/types"
import { TooltipProvider } from "@/packages/components/ui/tooltip"
import { Search } from "lucide-react"
import { Button } from "@/packages/components/ui/button"
import { Separator } from "@/packages/components/ui/separator"

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
    const pathname = usePathname()
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
            genes: parseQuery(queryTypes),
            conditions: parseQuery(queryTypes),
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

        const parsedBiosampleFilters = {
            types: parseQuery(queryTypes),
            genes: parseQuery(queryTypes),
            conditions: parseQuery(queryTypes),
            organizations: parseQuery(queryTypes),
        }
        initializeBiosampleSearch(parsedBiosampleFilters)
        console.log(`Biosample search initialized...`)

        const parsedDiseaseModelFilters = {
            types: parseQuery(queryTypes),
            genes: parseQuery(queryTypes),
            conditions: parseQuery(queryTypes),
            organizations: parseQuery(queryTypes),
        }
        initializeDiseaseModelSearch(parsedDiseaseModelFilters)
        console.log(`Disease Model search initialized...`)

        const parsedClinicalDatasetFilters = {
            types: parseQuery(queryTypes),
            genes: parseQuery(queryTypes),
            conditions: parseQuery(queryTypes),
            organizations: parseQuery(queryTypes),
        }
        initializeClinicalDatasetSearch(parsedClinicalDatasetFilters)
        console.log(`Clinical Dataset search initialized...`)
    }

    useEffect(() => {
        handleSessionUpdate()
    }, [session?.user?.organizationId]);

    return (
        <TooltipProvider>
            <div className="w-full flex justify-center">
                <div className="max-w-7xl mt-16 lg:mt-28 h-full w-full flex flex-col items-center p-4 gap-4 md:gap-6">
                    <div className="flex w-full flex-col gap-4">
                        <h1 className="text-3xl md:text-4xl font-semibold">Explore Comend</h1>
                    </div>
                    <Separator />
                    <PublicMarketplaceNav />
                    {children}
                </div>
            </div>
        </TooltipProvider>
    )
}
