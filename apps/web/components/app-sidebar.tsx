"use client"

import * as React from "react"
import {
    Cog,
    Store, User, Workflow,
    Megaphone,
    Bell,
    Microscope, 
    LayoutDashboard,
    Users,
} from "lucide-react"
import {NavMain} from "./../components/nav-main"
import {OrganizationSwitcher} from "./../components/organization-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarRail,
    useSidebar,
} from "@comend/components/ui/sidebar"
import {MembershipWithOrganization} from "@comend/lib/types";
import {Button} from "@comend/components/ui/button";
import Link from "next/link";
import {FeedbackSheet} from "./../components/feedback";
import {usePathname} from "next/navigation";
import {RoadmapState} from "./../state/roadmap/roadmapStore";
import {Separator} from "@comend/components/ui/separator"

// This is sample data.
const data = {
    navMain: [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            variant: "ghost",
            url: "/app/dashboard",
            subPages: []
        },
        // {
        //     title: "Shortlist",
        //     icon: Bookmark,
        //     variant: "ghost",
        //     url: "/app/saved/service-providers"
        // },
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
            // subPages: process.env.NEXT_PUBLIC_NODE_ENV !== "production" ? [
            //     {
            //         title: "Tool Requests",
            //         icon: TestTube,
            //         variant: "ghost",
            //         url: `/app/requests`,
            //         subPages: []
            //     }
            // ] : []
            subPages: []
        },
        {
            title: "Requests for Proposals",
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
            subPages: [
                {
                    title: "Team",
                    icon: Users,
                    variant: "ghost",
                    url: "/app/team",
                    subPages: []
                },
                {
                    title: "Settings",
                    icon: Cog,
                    variant: "ghost",
                    url: "/app/settings",
                    subPages: []
                },
            ]
        },
        {
            title: "Notifications",
            icon: Bell,
            variant: "ghost",
            url: "/app/notifications",
            subPages: []
        },
        {
            title: "Marketplace",
            icon: Store,
            variant: "ghost",
            url: "/app/marketplace",
            match: (path: string) => path.includes('/app/marketplace'),
            // subPages: [{
            //     title: "Saved",
            //     icon: Bookmark,
            //     variant: "ghost",
            //     match: (path: string) => path.startsWith('/app/saved'),
            //     url: "/app/saved/service-providers"
            // }]

            // subPages: [
            //     {
            //         title: "Service Providers",
            //         icon: Building2,
            //         variant: "ghost",
            //         url: "/app/marketplace/service-providers"
            //     },
            //     {
            //         title: "Patient Groups",
            //         icon: Users,
            //         variant: "ghost",
            //         url: "/app/marketplace/patient-groups"
            //     },
            //     {
            //         title: "Biosamples",
            //         icon: TestTubeDiagonal,
            //         variant: "ghost",
            //         url: "/app/marketplace/biosamples"
            //     },
            //     {
            //         title: "Disease Models",
            //         icon: Rat,
            //         variant: "ghost",
            //         url: "/app/marketplace/disease-models"
            //     },
            //     {
            //         title: "Clinical Datasets",
            //         icon: Database,
            //         variant: "ghost",
            //         url: "/app/marketplace/clinical-datasets"
            //     },
            // ]
        },
    ]
}

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    setSelectedNodeIds: state.setSelectedNodeIds
})

export function AppSidebar({memberships}: { memberships: MembershipWithOrganization[] }) {
    const pathname = usePathname()
    const {state} = useSidebar()

    const exploreSet = new Set(["Notifications", "Marketplace"])
    const exploreItems = data.navMain.filter(i => exploreSet.has(i.title))
    const manageItems = data.navMain.filter(i => !exploreSet.has(i.title))

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="bg-gray-50">
                <OrganizationSwitcher memberships={memberships}/>
            </SidebarHeader>
            <SidebarContent className="bg-gray-50">
                <SidebarGroup>
                    <SidebarGroupLabel>Manage</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <NavMain items={manageItems}/>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Explore</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <NavMain items={exploreItems}/>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="bg-gray-50 p-2">
                {/*<Separator className="w-full"/>*/}
                <div className="flex flex-col gap-1">
                    {/*<SidebarMenuButton*/}
                    {/*    asChild*/}
                    {/*    className={pathname.startsWith('/app/guides') ? "bg-blue-light border border-blue-dark text-primary" : ""}*/}
                    {/*>*/}
                    {/*    <Link href={'/app/guides'} className="flex">*/}
                    {/*        <div className="relative">*/}
                    {/*            <BookOpen className="mr-2 h-4 w-4"/>*/}
                    {/*            {state === "collapsed" &&*/}
                    {/*                <NavNotificationCollapsedIcon item={{title: 'Guides', url: '/app/guides'}}/>*/}
                    {/*            }*/}
                    {/*        </div>*/}
                    {/*        {'Guides'}*/}
                    {/*        {state === "expanded" &&*/}
                    {/*            <NavNotificationExpandedIcon item={{title: 'Guides', url: '/app/guides'}}/>*/}
                    {/*        }*/}
                    {/*    </Link>*/}
                    {/*</SidebarMenuButton>*/}
                    <FeedbackSheet/>
                </div>
                {state === "expanded" && (
                    <>
                        <Separator className="w-full"/>
                        <div className="w-full flex flex-wrap justify-start gap-1 p-2 items-center">
                            <Button variant="ghost"
                                    className="text-xs cky-banner-element p-0 flex justify-start m-0 h-fit hover:underline hover:bg-transparent">
                                Cookies
                            </Button>
                            <p className="text-md">{'\u00B7'}</p>
                            <Link href="https://www.comend.io/terms-of-service"
                                  className="text-xs hover:underline hover:text-primary">
                                Terms of Services
                            </Link>
                            <p className="text-md">{'\u00B7'}</p>
                            <Link
                                href="https://comend.notion.site/Comend-s-Policies-241801a6fddc801fb582d5d1b260c673?source=copy_link"
                                className="text-xs hover:underline hover:text-primary">
                                Privacy Policy
                            </Link>
                            {/* <p className="text-md">{'\u00B7'}</p> */}
                            <Link href="https://comend.io/security"
                                  className="text-xs hover:underline hover:text-primary">
                                Security Promise
                            </Link>
                            {/* <Button
                            variant="ghost"
                            className="pointer-events-none p-0"
                        >
                            <Image className="h-4 w-4" priority src={logo} alt="Comend logo"/>
                        </Button> */}
                        </div>
                    </>
                )}
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
