"use client"

import * as React from "react"
import { useNavStore, useSidebarStore } from "@/state/nav/navStore"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import {
    ResizablePanel,
    ResizablePanelGroup,
    ResizableHandle
} from "@/components/ui/resizable"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs"
import { PrivateFlowView } from "@/components/private-flow"
import { Button } from "./ui/button"
import { FaQuestion, FaX } from "react-icons/fa6"
import { EditMilestoneForm } from "./edit-milestone-form"
import { useEffect, useState } from "react"
import { MilestoneDetails } from "./milestone-details"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { GanttChartView } from "./gantt-chart"
import { useOnborda } from "./onborda/OnbordaContext"
import { FaRegQuestionCircle } from "react-icons/fa";

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    initState: state.initState
})

export function Roadmap({
    roadmapId,
    initNodes,
    initEdges,
    initMilestones,
    // initTasks
}: {
    roadmapId: string
    initNodes: any[]
    initEdges: any[]
    initMilestones: any[]
    // initTasks: any[]
}) {
    // Zustand state management
    const { defaultLayout, setLayout } = useSidebarStore()
    const { 
        selectedNodeId, 
        setSelectedNodeId, 
        milestones, 
        initState
    } = useRoadmapStore(useShallow(selector))
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { startOnborda } = useOnborda()

    const urlView = searchParams.get("view")
    const [view, setView] = useState(urlView ? urlView : "flow")

    // useEffect(() => {
    //     const params = new URLSearchParams(searchParams.toString())
    //     const urlMilestone: string | null = params.get("milestone")
    //     const urlTask: string | null = params.get("task")

    //     initState(initNodes, initEdges, initMilestones, urlMilestone, urlTask, roadmapId)
    // }, [])

    const handleMilestonePanelChange = (open: boolean) => {
        if (!open) {
            setSelectedNodeId(null)

            const params = new URLSearchParams(searchParams.toString())
            params.delete("milestone")
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
        if (open) {
            // setSelectedTaskId(null)

            const params = new URLSearchParams(searchParams.toString())
            params.delete("task")
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
    }

    const handleTaskPanelChange = (open: boolean) => {
        if (!open) {
            // setSelectedTaskId(null)

            const params = new URLSearchParams(searchParams.toString())
            params.delete("task")
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
        if (open) {
            setSelectedNodeId(null)

            const params = new URLSearchParams(searchParams.toString())
            params.delete("milestone")
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
    }

    const handleTabChange = (value: string) => {
        setView(value) // for the onboarding tutorial

        // close all panels when switching tabs
        setSelectedNodeId(null)
        // setSelectedTaskId(null)

        const params = new URLSearchParams(searchParams.toString())
        params.delete("view")
        params.delete("milestone")
        params.delete("task")
        params.set("view", value)

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    setLayout(sizes) // Use Zustand's setLayout to save panel sizes
                }}
                className="h-full items-stretch"
            >
                <ResizablePanel defaultSize={defaultLayout[0]} minSize={30}>
                    <Tabs defaultValue={urlView ? urlView : "flow"} onValueChange={handleTabChange}>
                        <div className="flex flex-row items-center p-1 gap-x-1">
                            <TabsList>
                                <TabsTrigger value="flow">Flow View</TabsTrigger>
                                {/* <TabsTrigger value="gantt">Gantt Chart View</TabsTrigger> */}
                            </TabsList>
                            {view === 'flow' && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                startOnborda('research-plan-tour')
                                            }}
                                        >
                                            <FaRegQuestionCircle/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Click to view the research plan onboarding tutorial</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>

                        {/* Flow View */}
                        <TabsContent
                            value="flow"
                            className="m-0 h-[calc(100vh-3.5rem)]"
                        >
                            <PrivateFlowView
                                width={defaultLayout[0]}
                            />
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
                            defaultSize={defaultLayout[1]}
                            minSize={30}
                            className="p-10 h-full flex flex-col gap-4"
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
    // const [isEditing, setIsEditing] = useState(false)
    const [isEditing, setIsEditing] = useState(true)

    const handleClose = () => {
        // setIsEditing(false)
        handlePanelChange(false)
    }

    return (
        <>
            <span className="flex flex-row justify-between items-center gap-4">
                {/* <h1 className="text-2xl font-bold grow">
                    {isEditing ? `Edit Milestone Details` : `Milestone Details`}
                </h1> */}
                {/* {isEditing ? (
                    <Button onClick={() => setIsEditing(false)}>
                        Cancel Editing
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>
                        Edit Milestone
                    </Button>
                )} */}
                {/* <Button variant="secondary" onClick={handleClose}>
                    <FaX />
                </Button> */}
            </span>
            {isEditing ? (
                <EditMilestoneForm
                    milestoneData={milestone}
                    onClose={handleClose}
                />
            ) : (
                <MilestoneDetails milestone={milestone} />
            )}
        </>
    )
}
