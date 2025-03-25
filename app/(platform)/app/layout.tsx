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
import {redirect, usePathname, useRouter, useSearchParams} from "next/navigation";
import Loading from "@/app/loading";
import {
    getAllNotifications,
    getColumns,
    getKanbanFromOrganizationId,
    getNodesEdgesAndMilestones,
    getRoadmapId
} from "@/lib/fetchers";
import {toast} from "sonner";
import {initializeCROSearch, initializeMilestoneSearch, initializeNotificationsState, initializeOrganizationSearch, initializeRoadmapState} from "@/lib/initialize-client-state";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import { createKanban, createRoadmap } from "@/lib/actions";
import { FeedbackSheet } from "@/components/feedback";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { useOnborda } from "@/components/onborda/OnbordaContext";
import { Button } from "@/components/ui/button";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { NotificationsState, useNotificationsStore } from "@/state/notifications/notificationsStore";
import { cn, sleep } from "@/lib/utils";

export type MemberWithOrganization = Member & {
    organization: Organization
};

interface AppLayoutProps {
    children: React.ReactNode
}

const selector = (state: RoadmapState) => ({
    setSelectedNodeId: state.setSelectedNodeId
})

export default function AppLayout({children}: AppLayoutProps) {
    const {data: session, status} = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const searchParams = useSearchParams()
    const prevSessionRef: React.MutableRefObject<typeof session | undefined | null> = useRef()
    const { startOnborda } = useOnborda()
    const pathname = usePathname()
    const { setSelectedNodeId } = useRoadmapStore(useShallow(selector))

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

            console.log(`Start initialization... for org ${session.user.organizationId}`)

            // Init Notifications Store
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
            
            // let kanban = await getKanbanFromOrganizationId()
            // if (!kanban.data && session.user.organizationId) {
            //     // kanban was not found, create it
            //     kanban = await createKanban(session.user.organizationId)
            // }

            // if (kanban.success) {
            //     const kanbanResponse = await getColumns(session.user.organizationId)
            //     if (kanbanResponse.success) {
            //         initializeKanbanState({
            //             columns: kanbanResponse.data.columns,
            //             kanbanId: kanban?.data?.id
            //         })
            //     }
            // } else {
            //     console.error(kanban.error)
            //     toast.error(kanban.error)
            // }

            // Init CRO Search Store
            initializeCROSearch()
            console.log(`CRO search initialized...`)

            // Init Milestone Search Store
            initializeMilestoneSearch()
            console.log(`Milestone search initialized...`)

            // Init Organization/PAG Search Store
            initializeOrganizationSearch()
            console.log(`Organization search initialized...`)

            // Init Research Plan Store
            let response = await getRoadmapId(session.user.organizationId)
            if (response.success) {
                // if we're on the research plan page and the resarch plan doesn't exist, create it, then initialize
                if (pathname === "/app/research-plan" && !response.data) {
                    console.log(`research plan doesn't exist, create it`)
                    const roadmap =  await createRoadmap(session.user.organizationId, {})
                    console.log(`roadmap`, roadmap)
                    response = await getRoadmapId(session.user.organizationId)
                }

                const nodesResponse = await getNodesEdgesAndMilestones(response.data)
                const urlNode = searchParams.get("milestone")
                const urlView = searchParams.get("view")
                if (nodesResponse.success) {
                    initializeRoadmapState({
                        roadmapId: response.data,
                        nodes: nodesResponse.data.nodes,
                        edges: nodesResponse.data.edges,
                        milestones: nodesResponse.data.milestones,
                        selectedView: urlView,
                        selectedNodeId: urlNode 
                    })
                } else {
                    // init state, but research plan has not been created yet
                    initializeRoadmapState({
                        roadmapId: null,
                        nodes: [],
                        edges: [],
                        milestones: [],
                        selectedView: null,
                        selectedNodeId: null 
                    })
                }
                console.log(`Research Plan initialized...`)
            } else {
                console.error(response.error)
                toast.error(response.error)
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
                <AppSidebar />
                <SidebarInset className="w-full max-w-full overflow-hidden">
                    <header className="bg-white sticky top-0 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-b bg-background w-full z-50 overflow-hidden">
                        <div className="w-full flex items-center justify-between gap-4 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <div className="flex items-center">
                                <Button 
                                    // className={cn(!pathname.includes('app/profile') && !pathname.includes('app/research-plan') ? "hidden" : "")}
                                    className={cn(!pathname.includes('app/research-plan') ? "hidden" : "")}
                                    // disabled={!pathname.includes('app/profile') && !pathname.includes('app/research-plan')}
                                    disabled={!pathname.includes('app/research-plan')}
                                    variant="ghost"
                                    onClick={() => {
                                        // if (pathname.includes('app/profile')) {
                                        //     startOnborda('organization-profile-tour')
                                        // } else if (pathname.includes('app/research-plan')) {
                                        //     setSelectedNodeId(null)
                                        //     startOnborda('research-plan-tour')
                                        // }
                                        if (pathname.includes('app/research-plan')) {
                                            setSelectedNodeId(null)
                                            startOnborda('research-plan-toru')
                                        }
                                    }}>
                                    <FaWandMagicSparkles/>
                                    <span>Take a tour</span>
                                </Button>
                                <FeedbackSheet />
                                <Button
                                    variant="ghost"
                                    // disabled={true}
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
