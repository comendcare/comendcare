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
import Loading from "@/loading";;
import {
    getAllMembershipsFromUserId,
    getAllNotifications,
    getAssets,
    getMilestoneTypes,
    getRFPs,
} from "@comend/lib/fetchers";
import {toast} from "sonner";
import {initializeAssetsStore, initializeCROSearch, initializeNotificationsState, initializeOrganizationSearch, initializeRFPStore} from "@comend/lib/initialize-client-state";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "~web/components/app-sidebar";
import { FeedbackSheet } from "~web/components/feedback";
import { useOnborda } from "@/components/onborda/OnbordaContext";
import { Button, buttonVariants } from "@/components/ui/button";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { NotificationsState, useNotificationsStore } from "@/state/notifications/notificationsStore";
import { cn, sleep } from "@comend/lib/utils";
import { BookOpen, Cookie, Wand2 } from "lucide-react";
import {useQueryState} from "nuqs"
import { ASSOCIATED_SYSTEMS, MembershipWithOrganization, MODALITIES, MOLECULAR_MECHANISMS } from "@comend/lib/types";
import Link from "next/link";
import {MobileWarning} from "~web/components/mobile-warning";
import {useIsMobile} from "@comend/lib/hooks/use-mobile";
import {LandingNavbar} from "~web/components/landing/landing-navbar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AppLayoutProps {
    children: React.ReactNode
}

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    setSelectedNodeIds: state.setSelectedNodeIds
})

// const parseQuery = (str: string | null) =>
//     str?.split(",").filter(Boolean).map((value) => ({ label: value, value })) || []

export default function AppLayout({children}: AppLayoutProps) {
    const {data: session, status} = useSession()
    const [isLoading, setIsLoading] = useState(true)
    // const searchParams = useSearchParams()
    const prevSessionRef: React.MutableRefObject<typeof session | undefined | null> = useRef()
    const { startOnborda } = useOnborda()
    const pathname = usePathname()
    const { roadmapId, setSelectedNodeIds } = useRoadmapStore(useShallow(selector))
    const [tourName, setTourName] = useState(getTourName())
    const [memberships, setMemberships] = useState<MembershipWithOrganization[]>([]);

    function getTourName() {
        if (pathname === '/app/research-plan') return 'research-plans-page-tour'
        if (pathname === `/app/research-plan/${roadmapId}`) return 'research-plan-tour'
        return null
    }

    async function handleSessionUpdate() {
        if (session) {
            try {
                const response = await getAllMembershipsFromUserId(session.user.id, {
                    id: true,
                    role: true,
                    title: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                    invitedBy: true,
                    organization: true,
                    organizationId: true,
                    user: true,
                    metadata: true
                });
                if (response.success) {
                    setMemberships(response.data ?? []);
                } else {
                    console.error(response.error);
                    toast.error(response.error);
                }
            } catch (err) {
                console.error(err);
                toast.error("Unexpected error fetching organizations.");
            }

            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/login");
        }
    }, [status])

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

    if (status === "authenticated" && session && !isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar memberships={memberships}/>
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
                                <Link type={'button'} href={'/app/guides'}>
                                    <Button variant={'ghost'}>
                                        <BookOpen />
                                        Guides
                                    </Button>
                                </Link>
                                <FeedbackSheet />
                                <TooltipProvider delayDuration={50}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant={"ghost"} className="cky-banner-element">
                                            <Cookie className="h-4 w-4"/>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-64">
                                            <p>{`Adjust cookie and consent settings`}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <Button
                                    variant="ghost"
                                    className="pointer-events-none p-0"
                                >
                                    <Image className="h-8 w-8 p-1" priority src={logo} alt="Comend logo" />
                                </Button>
                            </div>
                        </div>
                    </header>
                    <div className="flex h-[calc(100vh-3.5rem)] max-h-screen w-full overflow-hidden overflow-y-auto">
                        {/* {status !== "authenticated" || !session || isLoading  ? <Loading /> : (children)} */}
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    return <Loading />
}
