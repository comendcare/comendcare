"use client"

import * as React from "react"
import { useSidebarStore } from "@/state/nav/navStore"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import {
    ResizablePanel,
    ResizablePanelGroup,
    ResizableHandle
} from "@/components/ui/resizable"
import {
    TooltipProvider,
  } from "@/components/ui/tooltip"
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs"
import { PrivateFlowView } from "@/components/private-flow"
import { EditMilestoneForm } from "./edit-milestone-form"
import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { GanttChartView } from "./gantt-chart"
import { getRoadmapId } from "@/lib/fetchers"
import { PrivateTimelineView } from "./private-timeline"
import { buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { FaArrowUpRightFromSquare } from "react-icons/fa6"
import TemplatesPage from "@/app/(platform)/app/research-plan/templates/page"
import NewRoadmapForm from "./new-roadmap"
import RoadmapTemplates from "./roadmap-templates"

const selector = (state: RoadmapState) => ({
    isUpdating: state.isUpdating,
    roadmapId: state.roadmapId,
    nodes: state.nodes,
    edges: state.edges,
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    initState: state.initState
})

export function Roadmap({data}: {data: any}) {
    // Zustand state management
    const { defaultLayout, setLayout } = useSidebarStore()
    const { 
        isUpdating,
        roadmapId,
        nodes,
        edges,
        selectedNodeId, 
        setSelectedNodeId, 
        milestones, 
    } = useRoadmapStore(useShallow(selector))
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // useEffect(() => {
    //     if (data.id !== roadmapId || data.nodes.length !== nodes.length || data.milestones.length !== milestones.length || data.edges.length !== edges.length) {
    //         // roadmap data doesn't match, refresh the page
    //         console.log(`data does not match, refresh page...`)
    //         router.refresh()
    //     }
    // }, [])

    const urlView = searchParams.get("view")
    const [view, setView] = useState(urlView ? urlView : "flow")

    const handleMilestonePanelChange = (open: boolean) => {
        if (!open) {
            if (isUpdating) return
            setSelectedNodeId(null)

            const params = new URLSearchParams(searchParams.toString())
            params.delete("milestone")
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
        if (open) {
            // const params = new URLSearchParams(searchParams.toString())
            // params.delete("task")
            // router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
    }

    const handleTabChange = (value: string) => {
        setView(value) // for the onboarding tutorial

        // close all panels when switching tabs
        setSelectedNodeId(null)

        const params = new URLSearchParams(searchParams.toString())
        params.delete("view")
        params.delete("milestone")
        params.delete("task")
        params.set("view", value)

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    // if (!roadmapId) {
    //     return <NewRoadmapForm />
    // }

    // // if the user has no milestones, show them the template page
    // if (milestones && milestones.length === 0) {
    //     return <RoadmapTemplates />
    // }

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                // onLayout={(sizes: number[]) => {
                //     setLayout(sizes) // Use Zustand's setLayout to save panel sizes
                // }}
                className="h-full items-stretch"
            >
                <ResizablePanel>
                    <Tabs defaultValue={urlView ? urlView : "flow"} onValueChange={handleTabChange}>
                        <div className="flex flex-row items-center m-1 p-1 gap-x-1 justify-between">
                            <TabsList>
                                <TabsTrigger value="flow">Flow View</TabsTrigger>
                                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                                {/* <TabsTrigger value="gantt">Gantt Chart View</TabsTrigger> */}
                            </TabsList>

                            <Link
                                href={data?.organization?.subdomain ? `http://${data?.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan` : "/"}
                                className={cn(
                                    buttonVariants({ variant: "secondary" }),
                                    "flex items-center"
                                )}
                            >
                                {`View public research plan`}
                                <FaArrowUpRightFromSquare size={12}/>
                            </Link>
                        </div>

                        {/* Flow View */}
                        <TabsContent
                            value="flow"
                            className="m-0 h-[calc(100vh-6rem)]"
                        >
                            <PrivateFlowView
                                width={defaultLayout[0]}
                            />
                        </TabsContent>
                        
                        {/* Timeline view */}
                        <TabsContent
                            value="timeline"
                            className="m-0 h-[calc(100vh-6rem)]"
                        >
                            <PrivateTimelineView />
                        </TabsContent>

                        {/* Gantt Chart View */}
                        <TabsContent
                            value="gantt"
                            className="m-0 h-[calc(100vh-3.5rem)]"
                        >
                            <GanttChartView />
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>

                {selectedNodeId != null && (
                    <>
                        <ResizableHandle withHandle />

                        <ResizablePanel
                            defaultSize={40}
                            minSize={25}
                            className="h-full flex flex-col"
                        >
                            <MilestoneDetailsPanel
                                milestone={milestones.find(
                                    milestone =>
                                        milestone.nodeId === selectedNodeId
                                )}
                                handlePanelChange={handleMilestonePanelChange}
                            />
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}

const MilestoneDetailsPanel = ({
    milestone,
    handlePanelChange
}: {
    milestone: any
    handlePanelChange: (open: boolean) => void
}) => {
    const { 
        selectedNodeId, 
        setSelectedNodeId
    } = useRoadmapStore(useShallow(selector))
    // const [isEditing, setIsEditing] = useState(false)
    const [isEditing, setIsEditing] = useState(true)
    const [milestoneRemountKey, setMilestoneRemountKey] = useState(1)
    
    useEffect(() => {
        if (selectedNodeId) {
            // remount if the selected node has changed, this will re-initialize the form data
            // without closing the side panel since we're now editing a new node
            const remountkey = milestoneRemountKey
            setMilestoneRemountKey(remountkey + 1)
        }
    }, [selectedNodeId])

    const handleClose = () => {
        handlePanelChange(false)
    }

    return (
        <EditMilestoneForm
            key={milestoneRemountKey}
            milestoneData={milestone}
            onClose={handleClose}
        />
    )
}
