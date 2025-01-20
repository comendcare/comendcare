"use client"

import * as React from "react"
import {
    Cog,
    LayoutDashboard,
    Newspaper,
    Pin,
    Store, User, Workflow,
} from "lucide-react"

import {NavMain} from "@/components/nav-main"
import {NavUser} from "@/components/nav-user"
import {TeamSwitcher} from "@/components/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    getAllOrganizationsFromUserId, getColumns,
    getKanbanFromOrganizationId,
    getNodesEdgesAndMilestones,
    getRoadmapId
} from "@/lib/fetchers";
import {toast} from "sonner";
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useNavStore} from "@/state/nav/navStore";
import {initializeKanbanState, initializeRoadmapState} from "@/lib/initialize-client-state";
import {MemberWithOrganization} from "@/app/(platform)/app/layout";

// This is sample data.
const data = {
    navMain: [
        {
            title: "Profile",
            icon: User,
            variant: "ghost",
            url: "/app/profile"
        },
        {
            title: "Research Plan",
            icon: Workflow,
            variant: "ghost",
            url: `/app/research-plan`
        },
        {
            title: "Kanban",
            icon: Pin,
            variant: "ghost",
            url: "/app/kanban"
        },
        {
            title: "Feed",
            icon: Newspaper,
            variant: "ghost",
            url: "/app/feed",
            comingSoon: true
        },
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            variant: "ghost",
            url: "/app/dashboard",
            comingSoon: true
        },
        {
            title: "Marketplace",
            icon: Store,
            variant: "ghost",
            url: "/app/marketplace/patient-groups",
            comingSoon: true
        },
        {
            title: "Settings",
            icon: Cog,
            variant: "ghost",
            url: "/app/settings"
        },
    ]
}

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
    const {data: session, status, update} = useSession()
    const [isLoading, setIsLoading] = useState(true)
    const [organizations, setOrganizations] = useState<MemberWithOrganization[]>([]);

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

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={organizations}/>
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
