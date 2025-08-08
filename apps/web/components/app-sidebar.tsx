"use client"

import * as React from "react"
import {
    Cog,
    Store, User, Workflow,
    Bookmark,
    Megaphone,
    TestTube,
    Book, Wand2, BookOpen, Cookie,
    Microscope
} from "lucide-react"
import {NavMain} from "~web/components/nav-main"
import {NavUser} from "~web/components/nav-user"
import {OrganizationSwitcher} from "~web/components/organization-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenuButton,
    SidebarMenuItem,
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
import { Separator } from "@/packages/components/ui/separator"

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
                //     icon: Microscope,
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
            icon: Microscope,
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
            <SidebarFooter className="bg-gray-50 p-2">
                <Separator className="w-full"/>
                <div className="flex flex-col gap-1">
                <Button asChild variant="ghost" className={cn("flex justify-start p-2", pathname.startsWith('/app/guides') ? "bg-blue-light justify-start border border-blue-dark text-primary" : "")}>
                    <Link className="flex p-0 h-8" href={'/app/guides'}>
                        <Book className="mr-2 h-4 w-4"/>
                        <p className="p-0">{'Guides'}</p>
                    </Link>
                </Button>
                <FeedbackSheet />
                </div>
                <Separator className="w-full"/>
                <div className="w-full flex flex-wrap justify-start gap-1 p-2 items-center">
                    <Button variant="ghost" className="text-sm cky-banner-element p-0 flex justify-start m-0 h-fit hover:underline hover:bg-transparent">
                        Cookies
                    </Button>
                    <p className="text-md">{'\u00B7'}</p>
                    <Link href="https://www.comend.io/terms-of-service" className="text-sm hover:underline hover:text-primary">
                        Terms of Services
                    </Link>
                    <p className="text-md">{'\u00B7'}</p>
                    <Link href="https://comend.notion.site/Comend-s-Policies-241801a6fddc801fb582d5d1b260c673?source=copy_link" className="text-sm hover:underline hover:text-primary">
                        Privacy Policy
                    </Link>
                    <p className="text-md">{'\u00B7'}</p>
                    <Link href="https://comend.io/security" className="text-sm hover:underline hover:text-primary">
                        Security Promise
                    </Link>
                    {/* <Button
                        variant="ghost"
                        className="pointer-events-none p-0"
                    >
                        <Image className="h-4 w-4" priority src={logo} alt="Comend logo"/>
                    </Button> */}
                </div>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
