"use client"

import * as React from "react";
import {useNavStore} from "@/state/nav/navStore"; // Zustand store
import {TooltipProvider} from "@/components/ui/tooltip";
import {ResizablePanel, ResizablePanelGroup, ResizableHandle} from "@/components/ui/resizable";
import {Separator} from "@/components/ui/separator";
import {AppNav} from "@/components/app-nav";
import {Cog, Store, User, Workflow} from "lucide-react";
import {cn} from "@/lib/utils";
import Image from "next/image";
import logo from "@/public/logos/comend-logo.png";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {FaCity, FaPlus} from "react-icons/fa6";
import {useSession} from "next-auth/react";
import {Suspense, useEffect} from "react";
import Profile from "@/components/profile";
import { getRoadmapId, getUser } from "@/lib/actions";
import { useState } from "react";
import LoadingSpinner from "@/components/form/loading-spinner";

interface AppLayoutProps {
    children: React.ReactNode
}

export default function AppLayout({children}: AppLayoutProps) {
    const {data: session, update} = useSession()
    const [isLoading, setIsLoading] = useState(true)

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
                const user = await getUser(session.user.id)
                const defaultOrganization = user?.organizations && user.organizations.length > 0 ? user.organizations[0] : undefined

                if (!defaultOrganization) {
                    console.error(`no organizations found for this user...`)
                    return
                }

                orgId = defaultOrganization.id

                // add orgId to session, since it was previously undefiend
                await update({
                    ...session,
                    organizationId: orgId
                })
            }

            const roadmapId = await getRoadmapId(orgId)
            setRoadmapId(roadmapId)
            setIsLoading(false)
        }
    }

    useEffect(() => {
        handleSessionUpdate()
    }, [session])

    return (
        <div className="flex h-full w-full">
            {isLoading ? (
                <LoadingSpinner />
            ): (
                <ResizablePanelGroup
                    direction="horizontal"
                    onLayout={(sizes: number[]) => {
                        setLayout(sizes) // Use Zustand's setLayout to save panel sizes
                    }}
                    className="h-full w-full items-stretch"
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
                                "relative flex h-[52px] items-center justify-around",
                                isCollapsed ? "h-[52px]" : "px-2"
                            )}
                        >
                            <Image priority src={logo} alt="Librarey logo" className="size-6"/>
                            {/* Disabled - only one roadmap per org for now... */}
                            {/* <Select
                                defaultValue={organization?.id || ""}
                                onValueChange={async (value) => {
                                    console.log(`org changed`, value)
                                    await update({
                                        ...session,
                                        organizationId: value
                                    })
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={
                                        <div className="flex flex-row items-center justify-between gap-x-2">
                                            <FaCity/>
                                            Organization
                                        </div>
                                    }/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Organizations</SelectLabel> 
                                        {organizations?.map(org => (
                                            <SelectItem value={org.id}>{org.name}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select> */}
                        </div>
                        <Separator/>
                        <AppNav
                            isCollapsed={isCollapsed}
                            links={[
                                {title: "Roadmap", label: "128", icon: Workflow, variant: "ghost", href: roadmapId ? `/app/roadmap/${roadmapId}` : `/app/roadmap`},
                                {title: "Profile", icon: User, variant: "ghost", href: "/app/profile"},
                                {title: "Marketplace", label: "9", icon: Store, variant: "ghost", href: "/app/marketplace"},
                                {title: "Settings", icon: Cog, variant: "ghost", href: "/app/settings"},
                            ]}
                        >
                            <Suspense fallback={<div>Loading...</div>}>
                                <Profile/>
                            </Suspense>
                        </AppNav>
                    </ResizablePanel>

                    {/*Resizable Handle between panels */}
                    <ResizableHandle withHandle/>

                    {/* Main Content Panel */}
                    <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                        {children}
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
        </div>
    )
}
