"use client"

import * as React from "react";
import {useNavStore} from "@/state/nav/navStore"; // Zustand store
import {TooltipProvider} from "@/components/ui/tooltip";
import {ResizablePanel, ResizablePanelGroup, ResizableHandle} from "@/components/ui/resizable";
import {Separator} from "@/components/ui/separator";
import {AppNav} from "@/components/app-nav";
import {Cog, LayoutDashboard, Newspaper, Store, User, Workflow} from "lucide-react";
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
import {getAllOrganizationsFromUserId, getRoadmapId} from "@/lib/fetchers";
import {toast} from "sonner";


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
                const organization = response.data
                setRoadmapId(roadmapId)
                setIsLoading(false)
            } else {
                console.error(response.error)
                toast.error(response.error)
            }
        }
    }

    useEffect(() => {
        fetchOrganizations()
        handleSessionUpdate()
    }, [session])

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

    if (isLoading) {
        return <Loading/>
    }

    if (status === "authenticated" && session) {
        return (
            <div className="flex h-screen max-h-screen w-full">
                <ResizablePanelGroup
                    direction="horizontal"
                    onLayout={(sizes: number[]) => {
                        setLayout(sizes) // Use Zustand's setLayout to save panel sizes
                    }}
                    className="w-full items-stretch"
                >
                    {/* Navigation Panel */}
                    <ResizablePanel
                        defaultSize={defaultLayout[0]}
                        collapsedSize={4}
                        collapsible={true}
                        minSize={15}
                        maxSize={20}
                        onCollapse={() => setIsCollapsed(true)}
                        onResize={() => setIsCollapsed(false)}
                        className={isCollapsed ? "min-w-[50px] transition-all duration-300 ease-in-out" : ""}
                    >
                        <div
                            className={cn(
                                "relative flex h-[52px] items-center justify-around space-x-4",
                                isCollapsed ? "h-[102px] flex-col space-x-0" : "px-2"
                            )}
                        >
                            <Image priority src={logo} alt="Librarey logo" className="size-6"/>
                            {session.user.organizationId ?
                                <OrganizationSelector
                                    isCollapsed={isCollapsed}
                                    organizations={organizations}
                                />
                                : <Button>
                                    {isCollapsed ? <FaPlus/> : "Create or join an organization"}
                                </Button>
                            }
                        </div>
                        <Separator/>
                        <AppNav
                            isCollapsed={isCollapsed}
                            links={[
                                {title: "Profile", icon: User, variant: "ghost", href: "/app/profile"},
                                {
                                    title: "Feed",
                                    // label: "128",
                                    icon: Newspaper,
                                    variant: "ghost",
                                    href: "/app/feed"
                                },
                                {
                                    title: "Dashboard",
                                    // label: "128",
                                    icon: LayoutDashboard,
                                    variant: "ghost",
                                    href: "/app/dashboard"
                                },
                                {
                                    title: "Research Plan",
                                    // label: "128",
                                    icon: Workflow,
                                    variant: "ghost",
                                    href: roadmapId ? `/app/roadmap/${roadmapId}` : `/app/roadmap`
                                },
                                {
                                    title: "Marketplace",
                                    // label: "9",
                                    icon: Store,
                                    variant: "ghost",
                                    href: "/app/marketplace"
                                },
                                {title: "Settings", icon: Cog, variant: "ghost", href: "/app/settings"},
                            ]}
                        >
                            <Suspense fallback={<Loading/>}>
                                <Profile isCollapsed={isCollapsed}/>
                            </Suspense>
                        </AppNav>
                    </ResizablePanel>

                    {/*Resizable Handle between panels */}
                    <ResizableHandle withHandle/>

                    {/* Main Content Panel */}
                    <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="overflow-y-auto">
                        {children}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        )
    }
}
