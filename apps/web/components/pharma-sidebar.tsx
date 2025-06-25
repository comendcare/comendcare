"use client"

import * as React from "react"
import {
    ArrowUpCircleIcon,
    BarChartIcon,
    CameraIcon,
    ClipboardListIcon,
    DatabaseIcon,
    FileCodeIcon,
    FileIcon, FileSignature,
    FileTextIcon, FlaskConical,
    FolderIcon,
    HelpCircleIcon,
    LayoutDashboardIcon,
    ListIcon,
    SearchIcon,
    SettingsIcon, Stethoscope,
    UsersIcon,
} from "lucide-react"

import { NavProjects } from "~web/components/nav-projects"
import { NavMain } from "~web/components/nav-main"
import { NavSecondary } from "~web/components/nav-secondary"
import { NavUser } from "~web/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@comend/components/ui/sidebar"
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {getPharmaProjects} from "@comend/lib/fetchers";

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/pharma/dashboard",
            icon: LayoutDashboardIcon,
        },
        {
            title: "BioRepo",
            url: "#",
            icon: DatabaseIcon,
            comingSoon: true,
            badge: "80K",
        },
        {
            title: "Patient data",
            url: "#",
            icon: Stethoscope,
            comingSoon: true,
            badge: "11K",
        },
        {
            title: "Pre-clinical studies",
            url: "#",
            icon: FlaskConical,
            comingSoon: true,
            badge: "7K",
        },
        {
            title: "IP repository",
            url: "#",
            icon: FileSignature,
            comingSoon: true,
            badge: "1K",
        },
        {
            title: "Patient groups",
            url: "#",
            icon: UsersIcon,
            comingSoon: true,
            badge: "2.3K",
        },
    ],
    navSecondary: [
        {
            title: "Settings",
            url: "#",
            icon: SettingsIcon,
        },
        {
            title: "Get Help",
            url: "#",
            icon: HelpCircleIcon,
        },
    ],
    projects: [
        {
            name: "ASO for type 1 Arcadion",
            url: "#",
            icon: FolderIcon,
        },
        {
            name: "AAV for Celocyn Syndrome",
            url: "#",
            icon: FolderIcon,
        },
    ],
}

export function PharmaSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [projects, setProjects] = useState<any[] | null>(null)

    useEffect(() => {
        const fetchProjects = async () => {
            const result = await getPharmaProjects({
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
                metadata: true
            })
            if (result.success && result.data) {
                // Map DB projects to match NavProjects expected format
                const formatted = result.data.map((project: any) => ({
                    name: project.name ?? "Untitled Project",
                    url: `/pharma/project/${project.id}`,
                    icon: FolderIcon,
                }))
                setProjects(formatted)
            } else {
                setProjects([]) // or handle error differently
            }
        }

        fetchProjects()
    }, [])

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <a href="#">
                                <ArrowUpCircleIcon className="h-5 w-5" />
                                <span className="text-base font-semibold">Acme Inc.</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                {projects !== null ? (
                    <NavProjects items={projects} />
                ) : (
                    <div className="p-4 text-sm text-muted-foreground">Loading projects...</div>
                )}
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}
