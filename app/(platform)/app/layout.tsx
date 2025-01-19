"use client"

import * as React from "react";
import {useNavStore} from "@/state/nav/navStore"; // Zustand store
import {TooltipProvider} from "@/components/ui/tooltip";
import {ResizablePanel, ResizablePanelGroup, ResizableHandle} from "@/components/ui/resizable";
import {Separator} from "@/components/ui/separator";
import {AppNav} from "@/components/app-nav";
import {Cog, LayoutDashboard, Newspaper, Store, User, Workflow, Pin} from "lucide-react";
import {cn} from "@/lib/utils";
import Image from "next/image";
import logo from "@/public/logos/comend-logo.png";
import {useSession} from "next-auth/react";
import {Suspense, useEffect} from "react";
import Profile from "@/components/profile";
import {useState} from "react";
import {Member, Organization} from "@prisma/client";
import OrganizationSelector from "@/components/organization-selector";
import {redirect} from "next/navigation";
import {Button} from "@/components/ui/button";
import {FaPlus} from "react-icons/fa6";
import Loading from "@/app/loading";
import {
    getAllOrganizationsFromUserId,
    getColumns,
    getKanbanFromOrganizationId,
    getNodesEdgesAndMilestones,
    getRoadmapId
} from "@/lib/fetchers";
import {toast} from "sonner";
import {initializeKanbanState, initializeRoadmapState} from "@/lib/initialize-client-state";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";


export type MemberWithOrganization = Member & {
    organization: Organization
};

interface AppLayoutProps {
    children: React.ReactNode
}

export default function AppLayout({children}: AppLayoutProps) {
    const {data: session, status, update} = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [organizations, setOrganizations] = useState<MemberWithOrganization[]>([]);

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
    const {defaultLayout, isCollapsed, setIsCollapsed, setLayout} =
        useNavStore()
    const [roadmapId, setRoadmapId] = useState<string | undefined>(undefined)

    const handleSessionUpdate = async () => {
        if (session) {
            let orgId = undefined

            if (session.user.organizationId) {
                // org id is in the session, so we use that
                orgId = session.user.organizationId
            } else {
                // org id is not in the session, pull it from the database
                // const user = await getUser(session.user.id)
                // const defaultOrganization = user?.organizations && user.organizations.length > 0 ? user.organizations[0] : undefined

                // if (!defaultOrganization) {
                //     console.error(`no organizations found for this user...`)
                //     return
                // }

                // orgId = defaultOrganization.id

                // // add orgId to session, since it was previously undefiend
                // await update({
                //     ...session,
                //     organizationId: orgId
                // })
            }

            const response = await getRoadmapId(orgId)
            if (response.success) {
                setRoadmapId(response.data)
                const nodesResponse = await getNodesEdgesAndMilestones(response.data)
                if (nodesResponse.success) {
                    initializeRoadmapState({
                        roadmapId: response.data,
                        nodes: nodesResponse.data.nodes,
                        edges: nodesResponse.data.edges,
                        milestones: nodesResponse.data.milestones
                    })
                }
                setIsLoading(false)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }

            const kanban = await getKanbanFromOrganizationId()
            if (kanban.success) {
                const kanbanResponse = await getColumns(orgId)
                if (kanbanResponse.success) {
                    initializeKanbanState({
                        columns: kanbanResponse.data.columns
                    })
                }
                setIsLoading(false)
            } else {
                console.error(kanban.error)
                toast.error(kanban.error)
            }
        }
    }

    const fetchOrganizations = async () => {
        if (session) {
            const response = await getAllOrganizationsFromUserId(session.user.id);
            if (response.success) {
                const orgs = response.data ?? []
                setOrganizations(orgs)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }
    };

    useEffect(() => {
        fetchOrganizations()
        handleSessionUpdate()
    }, [session])

    if (isLoading) {
        return <Loading/>
    }

    if (status === "authenticated" && session) {
        return (
            <SidebarProvider>
                <AppSidebar/>
                <SidebarInset>
                    <div className="flex h-screen max-h-screen w-full">
                        {/*<SidebarTrigger className="h-10 w-10 size-10"/>*/}

                        {/*<ResizablePanelGroup*/}
                        {/*    direction="horizontal"*/}
                        {/*    onLayout={(sizes: number[]) => {*/}
                        {/*        setLayout(sizes) // Use Zustand's setLayout to save panel sizes*/}
                        {/*    }}*/}
                        {/*    className="w-full items-stretch"*/}
                        {/*>*/}
                            {/* Navigation Panel */}
                            {/*<ResizablePanel*/}
                            {/*    defaultSize={defaultLayout[0]}*/}
                            {/*    collapsedSize={4}*/}
                            {/*    collapsible={true}*/}
                            {/*    minSize={15}*/}
                            {/*    maxSize={20}*/}
                            {/*    onCollapse={() => setIsCollapsed(true)}*/}
                            {/*    onResize={() => setIsCollapsed(false)}*/}
                            {/*    className={isCollapsed ? "min-w-[50px] transition-all duration-300 ease-in-out" : ""}*/}
                            {/*>*/}
                            {/*    <div*/}
                            {/*        className={cn(*/}
                            {/*            "relative flex h-[52px] items-center justify-around space-x-4 mx-2",*/}
                            {/*            isCollapsed ? "h-[102px] flex-col space-x-0" : "px-2"*/}
                            {/*        )}*/}
                            {/*    >*/}
                            {/*        <Image priority src={logo} alt="Librarey logo" className="size-6"/>*/}
                            {/*        <OrganizationSelector*/}
                            {/*            isCollapsed={isCollapsed}*/}
                            {/*            organizations={organizations}*/}
                            {/*        />*/}
                            {/*    </div>*/}
                            {/*    <Separator/>*/}
                            {/*    <AppNav*/}
                            {/*        isCollapsed={isCollapsed}*/}
                            {/*        links={[*/}
                            {/*            {title: "Profile", icon: User, variant: "ghost", href: "/app/profile"},*/}
                            {/*            {title: "Kanban", icon: Pin, variant: "ghost", href: "/app/kanban"},*/}
                            {/*            {*/}
                            {/*                title: "Feed",*/}
                            {/*                // label: "128",*/}
                            {/*                icon: Newspaper,*/}
                            {/*                variant: "ghost",*/}
                            {/*                href: "/app/feed"*/}
                            {/*            },*/}
                            {/*            {*/}
                            {/*                title: "Dashboard",*/}
                            {/*                // label: "128",*/}
                            {/*                icon: LayoutDashboard,*/}
                            {/*                variant: "ghost",*/}
                            {/*                href: "/app/dashboard"*/}
                            {/*            },*/}
                            {/*            {*/}
                            {/*                title: "Research Plan",*/}
                            {/*                // label: "128",*/}
                            {/*                icon: Workflow,*/}
                            {/*                variant: "ghost",*/}
                            {/*                href: `/app/research-plan`*/}
                            {/*            },*/}
                            {/*            {*/}
                            {/*                title: "Marketplace",*/}
                            {/*                // label: "9",*/}
                            {/*                icon: Store,*/}
                            {/*                variant: "ghost",*/}
                            {/*                href: "/app/marketplace/patient-groups"*/}
                            {/*            },*/}
                            {/*            {title: "Settings", icon: Cog, variant: "ghost", href: "/app/settings"},*/}
                            {/*        ]}*/}
                            {/*    >*/}
                            {/*        <Suspense fallback={<Loading/>}>*/}
                            {/*            <Profile isCollapsed={isCollapsed}/>*/}
                            {/*        </Suspense>*/}
                            {/*    </AppNav>*/}
                            {/*</ResizablePanel>*/}

                            {/*/!*Resizable Handle between panels *!/*/}
                            {/*<ResizableHandle withHandle/>*/}

                            {/* Main Content Panel */}
                            {/*<ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="overflow-y-auto">*/}
                                {children}
                            {/*</ResizablePanel>*/}
                        {/*</ResizablePanelGroup>*/}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }
}
