"use client"

import * as React from "react"
import {
    Cog,
    Store, User, Workflow,
    Bookmark,
    HardDriveDownload,
    LayoutDashboard,
    Search,
    Settings,
    Star,
    Megaphone, TestTubeDiagonal
} from "lucide-react"
import {NavMain} from "~web/components/nav-main"
import {NavUser} from "~web/components/nav-user"
import {OrganizationSwitcher} from "~web/components/organization-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@comend/components/ui/sidebar"
import {
    getAllMembershipsFromUserId,
} from "@comend/lib/fetchers";
import {toast} from "sonner";
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {MembershipWithOrganization} from "@comend/lib/types";

// This is sample data.
const data = {
    navMain: [
        {
            title: "Marketplace",
            icon: Store,
            variant: "ghost",
            url: "/app/marketplace/service-providers",
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
            subPages: [
                // {
                //     title: "Assets",
                //     icon: Star,
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
            title: "Tools",
            icon: Star,
            variant: "ghost",
            url: `/app/tools`,
            subPages: []
        },
        {
            title: "RFPs",
            icon: Megaphone,
            variant: "ghost",
            url: `/app/rfps`,
            subPages: []
        },
        {
            title: "Toolkit",
            icon: TestTubeDiagonal,
            variant: "ghost",
            url: "/app/tools",
            subPages: [
                {
                    title: "Toolkit Dashboard",
                    icon: LayoutDashboard,
                    variant: "ghost",
                    url: "/"
                },
                {
                    title: "Specimen Browser",
                    icon: Search,
                    variant: "ghost",
                    url: "/"
                },
                {
                    title: "Sample Requests",
                    icon: HardDriveDownload,
                    variant: "ghost",
                    url: "/"
                },
                {
                    title: "Toolkit Settings",
                    icon: Settings,
                    variant: "ghost",
                    url: "/"
                },
            ]
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

export function AppSidebar({memberships}: { memberships: MembershipWithOrganization[] }) {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <OrganizationSwitcher memberships={memberships}/>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain}/>
            </SidebarContent>
            <SidebarFooter>
                <NavUser/>
            </SidebarFooter>
            <SidebarRail/>
        </Sidebar>
    )
}
