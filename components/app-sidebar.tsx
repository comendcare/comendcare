"use client"

import * as React from "react"
import {
    Cog,
    Store, User, Workflow,
    Bookmark,
    Star,
    Megaphone
} from "lucide-react"
import {NavMain} from "@/components/nav-main"
import {NavUser} from "@/components/nav-user"
import {OrganizationSwitcher} from "@/components/organization-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    getAllMembershipsFromUserId,
} from "@/lib/fetchers";
import {toast} from "sonner";
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {MemberWithOrganization} from "@/app/(platform)/app/layout";

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
                url: "/app/shortlist"
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

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {data: session} = useSession()
    const [memberships, setMemberships] = useState<MemberWithOrganization[]>([]);

    useEffect(() => {
        const fetchOrganizations = async () => {
            if (session) {
                const response = await getAllMembershipsFromUserId(session.user.id);
                if (response.success) {
                    const orgs = response.data ?? []
                    setMemberships(orgs)
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }
            }
        };
        
        fetchOrganizations()
    }, [session])

    return (
        <Sidebar collapsible="icon" {...props}>
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
