"use client"

import * as React from "react";
import {useNavStore} from "@/state/nav/navStore"; // Zustand store
import {ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {useSession} from "next-auth/react";
import {useEffect, useRef} from "react";
import Image from "next/image"
import logo from "@/public/logo-square.png"
import {useState} from "react";
import {Member, Organization} from "@prisma/client";
import {redirect, usePathname, useSearchParams} from "next/navigation";
import Loading from "@/app/loading";
import {
    getAllNotifications,
    getAssets,
    getMilestoneTypes,
    getRFPs,
} from "@/lib/fetchers";
import {toast} from "sonner";
import {
    initializeAssetsStore,
    initializeCROSearch,
    initializeNotificationsState,
    initializeOrganizationSearch,
    initializeRFPStore,
    initializeRoadmapState
} from "@/lib/initialize-client-state";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {createKanban, createRoadmap} from "@/lib/actions";
import {FeedbackSheet} from "@/components/feedback";
import {useOnborda} from "@/components/onborda/OnbordaContext";
import {Button} from "@/components/ui/button";
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore";
import {useShallow} from "zustand/react/shallow";
import {NotificationsState, useNotificationsStore} from "@/state/notifications/notificationsStore";
import {cn, sleep} from "@/lib/utils";
import {Wand2} from "lucide-react";
import {useQueryState} from "nuqs"
import {ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS} from "@/lib/types";
import {PharmaSidebar} from "@/components/pharma-sidebar";
import {PharmaHeader} from "@/components/pharma-header";

export type MemberWithOrganization = Member & {
    organization: Organization
};

interface AppLayoutProps {
    children: React.ReactNode
}

const selector = (state: RoadmapState) => ({
    setSelectedNodeId: state.setSelectedNodeId
})

const parseQuery = (str: string | null) =>
    str?.split(",").filter(Boolean).map((value) => ({label: value, value})) || []

export default function AppLayout({children}: AppLayoutProps) {
    const {data: session, status} = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const searchParams = useSearchParams()
    const prevSessionRef: React.MutableRefObject<typeof session | undefined | null> = useRef()
    const {startOnborda} = useOnborda()
    const pathname = usePathname()
    const {setSelectedNodeId} = useRoadmapStore(useShallow(selector))

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

    useEffect(() => {
        // Handle loading state for the session
        if (status === "loading") {
            setIsLoading(true);
        } else {
            // setIsLoading(false);

            // Redirect if unauthenticated
            if (status === "unauthenticated") {
                redirect("/login");
            }
        }
    }, [status])

    const handleSessionUpdate = async () => {
        console.log(`session changed`, session)
        if (session) {
            setIsLoading(true)

            if (!session.user.organizationId) {
                console.error("Organization id is not set in the session... session data is ", session)
                // toast.error("Error, the organization id is not set.")
                setIsLoading(false)
                return
            }

            // Init relevant Zustand stores
            console.log(`Start initialization... for org ${session.user.organizationId}`)

            // Init notifications
            let notifications = await getAllNotifications()
            if (notifications.success && notifications.data) {
                initializeNotificationsState({
                    notifications: notifications.data
                })
            } else {
                console.error(notifications.error)
                toast.error(notifications.error)
            }
            console.log(`Notificaions initialized...`)

            // init CRO Search store
            const milestoneTypes = await getMilestoneTypes()
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

            // init roadmap/research plan store

            // init asset store
            let assetResponse = await getAssets(session.user.organizationId)
            if (assetResponse.success) {
                initializeAssetsStore(assetResponse.data || [])
                console.log(`Tools initialized...`)
            } else {
                console.error(assetResponse.error)
                toast.error(assetResponse.error)
            }

            // init rfp store
            let rfpResponse = await getRFPs(session.user.organizationId)
            if (rfpResponse.success) {
                initializeRFPStore(rfpResponse.data || [])
                console.log(`RFPs initialized...`)
            } else {
                console.error(rfpResponse.error)
                toast.error(rfpResponse.error)
            }

            console.log(`Initialization completed successfully!`)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        // Only run if the session data has changed or the session has not yet been set up
        console.log(`session changed:`, session, `\nauthenticated: ${status === "authenticated"}\nsession has changed: ${JSON.stringify(prevSessionRef?.current?.user) != JSON.stringify(session?.user)}`)
        if (
            // !isLoading &&
            status !== "authenticated" ||
            !session ||
            JSON.stringify(prevSessionRef?.current?.user) != JSON.stringify(session?.user)
        ) {
            handleSessionUpdate()
        }

        // Update the ref to the latest session
        prevSessionRef.current = session
    }, [session]); // For some reason, adding status and handleSessionUpdate as dependencies causes switching orgs to fail.

    if (status === "authenticated" && session) {
        return (
            <SidebarProvider>
                <PharmaSidebar/>
                <SidebarInset>
                    <PharmaHeader/>
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                {status !== "authenticated" || !session || isLoading ? <Loading/> : (children)}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    return <Loading/>
}
