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
import {initializeAssetsStore, initializeCROSearch, initializeNotificationsState, initializeOrganizationSearch, initializeRFPStore} from "@/lib/initialize-client-state";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import { FeedbackSheet } from "@/components/feedback";
import { useOnborda } from "@/components/onborda/OnbordaContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { NotificationsState, useNotificationsStore } from "@/state/notifications/notificationsStore";
import { cn, sleep } from "@/lib/utils";
import { BookOpen, Wand2 } from "lucide-react";
import {useQueryState} from "nuqs"
import { ASSOCIATED_SYSTEMS, MODALITIES, MOLECULAR_MECHANISMS } from "@/lib/types";
import Link from "next/link";
import {MobileWarning} from "@/components/mobile-warning";
import {useIsMobile} from "@/lib/hooks/use-mobile";
import {LandingNavbar} from "@/components/layout/sections/landing-navbar";

export type MemberWithOrganization = Member & {
    organization: Organization
};

interface AppLayoutProps {
    children: React.ReactNode
}

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    setSelectedNodeIds: state.setSelectedNodeIds
})

const parseQuery = (str: string | null) =>
    str?.split(",").filter(Boolean).map((value) => ({ label: value, value })) || []

export default function AppLayout({children}: AppLayoutProps) {
    const {data: session, status} = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const searchParams = useSearchParams()
    const prevSessionRef: React.MutableRefObject<typeof session | undefined | null> = useRef()
    const { startOnborda } = useOnborda()
    const pathname = usePathname()
    const { roadmapId, setSelectedNodeIds } = useRoadmapStore(useShallow(selector))
    const [tourName, setTourName] = useState(getTourName())

    function getTourName() {
        if (pathname === '/app/research-plan') return 'research-plans-page-tour'
        if (pathname === `/app/research-plan/${roadmapId}`) return 'research-plan-tour'
        return null
    }

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
            let notifications = await getAllNotifications({
                id: true,
                type: true,
                title: true,
                message: true,
                link: true,
                createdAt: true,
                updatedAt: true,
                lastViewedAt: true,
            })
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

            // init tool store
            let toolResponse = await getAssets(session.user.organizationId, {
                id: true,
                title: true,
                description: true,
                contacts: true,
                attachments: true,
                private: true,
                pinned: true,
                milestones: true
            })
            if (toolResponse.success) {
                initializeAssetsStore(toolResponse.data || [])
                console.log(`Tools initialized...`)
            } else {
                console.error(toolResponse.error)
                toast.error(toolResponse.error)
            }

            // init rfp store
            let rfpResponse = await getRFPs(session.user.organizationId, {
                id: true,
                title: true,
                description: true,
                openTo: true,
                startDate: true,
                endDate: true,
                contacts: true,
                attachments: true,
                budget: true,
                private: true,
                headerImage: true,
                pinned: true,
                milestones: true,
                organizationId: true,
            })
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
        // console.log(`session changed:`, session, `\nauthenticated: ${status === "authenticated"}\nsession has changed: ${JSON.stringify(prevSessionRef?.current?.user) != JSON.stringify(session?.user)}`)
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

    useEffect(() => {
        setTourName(getTourName())
    }, [pathname, roadmapId, getTourName])

    const isMobile = useIsMobile()
    if (isMobile) return <>
        <MobileWarning />
    </>

    if (status === "authenticated" && session) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="w-full max-w-full overflow-hidden">
                    <header className="bg-white sticky top-0 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-b bg-background w-full z-50 overflow-hidden">
                        <div className="w-full flex items-center justify-between gap-4 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <div className="flex items-center">
                                <Button 
                                    className={cn(tourName ? "" : "hidden")}
                                    disabled={!tourName}
                                    variant="ghost"
                                    onClick={() => {
                                        if (tourName) {
                                            setSelectedNodeIds([])
                                            startOnborda(tourName)
                                        }
                                    }}>
                                    <Wand2 aria-hidden={true} />
                                    Take a tour
                                </Button>
                                {/* <Link type={'button'} href={'/app/guides'}>
                                    <Button variant={'ghost'}>
                                        <BookOpen />
                                        Guides
                                    </Button>
                                </Link> */}
                                <FeedbackSheet />
                                <Button
                                    variant="ghost"
                                    className="pointer-events-none"
                                >
                                    <Image className="h-8 w-8 p-1" priority src={logo} alt="Comend logo" />
                                </Button>
                            </div>
                        </div>
                    </header>
                    <div className="flex h-[calc(100vh-3.5rem)] max-h-screen w-full overflow-hidden overflow-y-auto">
                        {status !== "authenticated" || !session || isLoading  ? <Loading /> : (children)}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    return <Loading />
}
