"use client"

import * as React from "react"
import {
    Cog,
    Store, User, Workflow,
    Bookmark,
    ToolCase,
    Megaphone,
    TestTube,
    Book, Wand2, BookOpen, Cookie
} from "lucide-react"
import {NavMain} from "~web/components/nav-main"
import {NavUser} from "~web/components/nav-user"
import {OrganizationSwitcher} from "~web/components/organization-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail, SidebarTrigger,
} from "@comend/components/ui/sidebar"
import {MembershipWithOrganization} from "@comend/lib/types";
import Image from "next/image"
import {Button, buttonVariants} from "@comend/components/ui/button";
import logo from "@/public/logo-square.png"
import {cn} from "@/packages/lib/utils";
import Link from "next/link";
import {FeedbackSheet} from "~web/components/feedback";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/packages/components/ui/tooltip";
import {useEffect, useRef, useState} from "react";
import {redirect, usePathname} from "next/navigation";
import {getAllMembershipsFromUserId} from "@/packages/lib/fetchers";
import {toast} from "sonner";
import {useOnborda} from "~web/components/onborda/OnbordaContext";
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore";
import {useShallow} from "zustand/react/shallow";
import {useSession} from "next-auth/react";

// This is sample data.
const data = {
    navMain: [
        {
            title: "Marketplace",
            icon: Store,
            variant: "ghost",
            url: "/app/marketplace/service-providers",
            match: (path: string) => path.startsWith('/app/marketplace'),
            subPages: [{
                title: "Shortlist",
                icon: Bookmark,
                variant: "ghost",
                url: "/app/shortlist/service-providers"
            }]
        },
        {
            title: "Research Planner",
            icon: Workflow,
            variant: "ghost",
            url: `/app/research-plan`,
            match: (path: string) => path.startsWith('/app/research-plan'),
            subPages: [
                // {
                //     title: "Assets",
                //     icon: ToolCase,
                //     variant: "ghost",
                //     url: `/app/tools`,
                //     subPages: []
                // },
                // {
                //     title: "RFPs",
                //     icon: Megaphone,
                //     variant: "ghost",
                //     url: `/app/rfps`,
                //     subPages: []
                // }
            ]
        },
        {
            title: "Toolkit",
            icon: ToolCase,
            variant: "ghost",
            url: `/app/tools/biosample`,
            match: (path: string) => path.startsWith('/app/tools'),
            subPages: process.env.NEXT_PUBLIC_NODE_ENV !== "production" ? [
                {
                    title: "Tool Requests",
                    icon: TestTube,
                    variant: "ghost",
                    url: `/app/requests`,
                    subPages: []
                }
            ] : []
        },
        {
            title: "RFPs",
            icon: Megaphone,
            variant: "ghost",
            url: `/app/rfps`,
            subPages: []
        },
        {
            title: "Organization Profile",
            icon: User,
            variant: "ghost",
            url: "/app/profile",
            subPages: []
        },
        {
            title: "Organization Settings",
            icon: Cog,
            variant: "ghost",
            url: "/app/settings",
            subPages: []
        },
    ]
}

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    setSelectedNodeIds: state.setSelectedNodeIds
})

export function AppSidebar({memberships}: { memberships: MembershipWithOrganization[] }) {
    const {data: session, status} = useSession()
    const {startOnborda} = useOnborda()
    const pathname = usePathname()
    const {roadmapId, setSelectedNodeIds} = useRoadmapStore(useShallow(selector))
    const [tourName, setTourName] = useState(getTourName())

    function getTourName() {
        if (pathname === '/app/research-plan') return 'research-plans-page-tour'
        if (pathname === `/app/research-plan/${roadmapId}`) return 'research-plan-tour'
        return null
    }

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/login");
        }
    }, [status])

    useEffect(() => {
        setTourName(getTourName())
    }, [pathname, roadmapId, getTourName])

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="bg-gray-50">
                <OrganizationSwitcher memberships={memberships}/>
            </SidebarHeader>
            <SidebarContent className="bg-gray-50">
                <NavMain items={data.navMain}/>
            </SidebarContent>
            <SidebarFooter className="bg-gray-50">
                <div className="w-full flex items-center justify-center space-x-2">
                    {/*<Button*/}
                    {/*    className={cn(tourName ? "" : "hidden")}*/}
                    {/*    disabled={!tourName}*/}
                    {/*    variant="ghost"*/}
                    {/*    onClick={() => {*/}
                    {/*        if (tourName) {*/}
                    {/*            setSelectedNodeIds([])*/}
                    {/*            startOnborda(tourName)*/}
                    {/*        }*/}
                    {/*    }}>*/}
                    {/*    <Wand2 aria-hidden={true}/>*/}
                    {/*    Take a tour*/}
                    {/*</Button>*/}
                    <Link href={'/app/guides'} className="text-xs">
                        Guides
                    </Link>
                    <FeedbackSheet/>
                    <TooltipProvider delayDuration={50}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-xs">
                                    Cookies
                                </div>
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
                        <Image className="h-4 w-4" priority src={logo} alt="Comend logo"/>
                    </Button>
                </div>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
