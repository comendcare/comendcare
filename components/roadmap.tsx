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

const selector = (state: RoadmapState) => ({
    selectedView: state.selectedView,
    setSelectedView: state.setSelectedView,
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    initState: state.initState
})

export function Roadmap({data}: {data?: any}) {
    // Zustand state management
    const { defaultLayout } = useSidebarStore()
    const { 
        selectedView,
        setSelectedView,
        selectedNodeId, 
        setSelectedNodeId, 
        milestones, 
    } = useRoadmapStore(useShallow(selector))
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        if (selectedNodeId) {
            params.set("milestone", selectedNodeId)
        } else {
            params.delete("milestone")
        }

        if (selectedView) {
            params.set("view", selectedView)
        } else {
            params.delete("view")
        }

        router.push(`${pathname}?${params}`)
    }, [selectedNodeId, selectedView])
    

    const handleMilestonePanelChange = (open: boolean) => {
        if (!open) { setSelectedNodeId(null) }
    }

    const handleTabChange = (value: string) => {
        setSelectedView(value)
        setSelectedNodeId(null) // deselect any selected milestones when switching tabs
    }

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
                    <Tabs defaultValue={selectedView ? selectedView : "flow"} onValueChange={handleTabChange}>
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
