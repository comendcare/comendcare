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
    getColumns,
    getKanbanFromOrganizationId,
    getNodesEdgesAndMilestones,
    getRoadmapId
} from "@/lib/fetchers";
import {toast} from "sonner";
import {initializeKanbanState, initializeRoadmapState} from "@/lib/initialize-client-state";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import { createKanban } from "@/lib/actions";
import { FeedbackSheet } from "@/components/feedback";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { useOnborda } from "@/components/onborda/OnbordaContext";
import { Button } from "@/components/ui/button";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";

export type MemberWithOrganization = Member & {
    organization: Organization
};

interface AppLayoutProps {
    children: React.ReactNode
}

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    nodes: state.nodes,
    edges: state.edges,
    selectedView: state.selectedView,
    setSelectedView: state.setSelectedView,
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    initState: state.initState
})

export default function AppLayout({children}: AppLayoutProps) {
    const {data: session, status} = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const searchParams = useSearchParams()
    const { startOnborda } = useOnborda()
    const pathname = usePathname()
    const { 
        roadmapId,
        selectedView,
        setSelectedView,
        selectedNodeId, 
        setSelectedNodeId, 
        milestones, 
    } = useRoadmapStore(useShallow(selector))
    const [sidebarOpen, setSidebarOpen] = useState(selectedNodeId === null)

    useEffect(() => {
        if (selectedNodeId !== null) setSidebarOpen(false)
    }, [selectedNodeId])

    useEffect(() => {
        // Handle loading state for the session
        if (status === "loading") {
            setIsLoading(true);
        } else {
            setIsLoading(false);

            // Redirect if unauthenticated
            if (status === "unauthenticated") {
                redirect("/login");
            }
        }
    }, [status])

    // Zustand state management
    // const {defaultLayout, isCollapsed, setIsCollapsed, setLayout} = useNavStore()

    const handleSessionUpdate = async () => {
        console.log(`session changed`, session)
        if (session) {
            // if the roadmap is not defined, we use the loading visual
            // if the roadmap is already initialized, we don't show the loading state as to not interrupt the user experience
            if (!roadmapId) setIsLoading(true)

            if (!session.user.organizationId) {
                console.error("Organization id is not set in the session... session data is ", session)
                toast.error("Error, the organization id is not set.")
                setIsLoading(false)
                return
            }

            const response = await getRoadmapId(session.user.organizationId)
            if (response.success) {
                // setRoadmapId(response.data)
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
                }
            } else {
                console.error(response.error)
                toast.error(response.error)
            }

            let kanban = await getKanbanFromOrganizationId()
            if (!kanban.data && session.user.organizationId) {
                // kanban was not found, create it
                kanban = await createKanban(session.user.organizationId)
            }

            if (kanban.success) {
                const kanbanResponse = await getColumns(session.user.organizationId)
                if (kanbanResponse.success) {
                    initializeKanbanState({
                        columns: kanbanResponse.data.columns
                    })
                }
            } else {
                console.error(kanban.error)
                toast.error(kanban.error)
            }

            console.log(`Research plan and kanban zustand states initialized successfully!`)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        handleSessionUpdate()
    }, [session]);

    if (status === "authenticated" && session) {
        return (
            <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <AppSidebar />
                <SidebarInset className="w-full max-w-full overflow-hidden">
                    <header className="sticky top-0 flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 border-b bg-background w-full z-50 overflow-hidden">
                        <div className="w-full flex items-center justify-between gap-4 px-4">
                            <SidebarTrigger className="-ml-1" />
                            <div className="flex items-center">
                                <Button 
                                    disabled={!pathname.includes('app/profile') && !pathname.includes('app/research-plan')}
                                    variant="ghost"
                                    onClick={() => {
                                        console.log(`pathname`, pathname)
                                        if (pathname.includes('app/profile')) {
                                            startOnborda('organization-profile-tour')
                                        } else if (pathname.includes('app/research-plan')) {
                                            startOnborda('research-plan-tour')
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
                        {isLoading ? <Loading /> : (children)}
                        {/* {children} */}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }
}
