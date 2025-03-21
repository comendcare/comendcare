"use client"

import * as React from "react"
import {
    Cog,
    LayoutDashboard,
    Newspaper,
    Pin,
    Store, User, Workflow,
    Bookmark
} from "lucide-react"
import { FaRegBookmark } from "react-icons/fa6"

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
import { KANBAN_NOTIFICATIONS } from "@/lib/types"

// This is sample data.
const data = {
    navMain: [
        {
            title: "Marketplace",
            icon: Store,
            variant: "ghost",
            url: "/app/marketplace/cro",
            subPages: [{
                title: "Saves",
                icon: Bookmark,
                variant: "ghost",
                url: "/app/saves"
            }]
        },
        {
            title: "Research Planner",
            icon: Workflow,
            variant: "ghost",
            url: `/app/research-plan`,
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

    useEffect(() => {
        fetchOrganizations()
    }, [fetchOrganizations, session])

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
