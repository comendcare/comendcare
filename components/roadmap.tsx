"use client"

import * as React from "react"
import { useNavStore, useSidebarStore } from "@/state/nav/navStore"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
    ResizablePanel,
    ResizablePanelGroup,
    ResizableHandle
} from "@/components/ui/resizable"
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs"
import { FlowView } from "@/components/flow"
import { KanbanView } from "@/components/kanban"
import { Button } from "./ui/button"
import { FaX } from "react-icons/fa6"
import { EditMilestoneForm } from "./edit-milestone-form"
import { useEffect, useState } from "react"
import { MilestoneDetails } from "./milestone-details"
import { EditTaskForm } from "./edit-task-form"
import { TaskDetails } from "./task-details"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { GanttChartView } from "./gantt-chart"

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    selectedTaskId: state.selectedTaskId,
    setSelectedTaskId: state.setSelectedTaskId,
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
        selectedTaskId, 
        setSelectedTaskId, 
        milestones, 
        initState
    } = useRoadmapStore(useShallow(selector))
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const urlView = searchParams.get("view")

    const handleMilestonePanelChange = (open: boolean) => {
        if (!open) {
            setSelectedNodeId(null)

            const params = new URLSearchParams(searchParams.toString())
            params.delete("milestone")
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
        if (open) {
            setSelectedTaskId(null)

            const params = new URLSearchParams(searchParams.toString())
            params.delete("task")
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
    }

    const handleTaskPanelChange = (open: boolean) => {
        if (!open) {
            setSelectedTaskId(null)

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
        // close all panels when switching tabs
        setSelectedNodeId(null)
        setSelectedTaskId(null)

        const params = new URLSearchParams(searchParams.toString())
        params.delete("view")
        params.delete("milestone")
        params.delete("task")
        params.set("view", value)

        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        const urlMilestone: string | null = params.get("milestone")
        const urlTask: string | null = params.get("task")

        initState(initNodes, initEdges, initMilestones, urlMilestone, urlTask, roadmapId)
    }, [])

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
                    <Tabs defaultValue={urlView ? urlView : "roadmap"} onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                            <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
                            <TabsTrigger value="kanban">Kanban</TabsTrigger>
                        </TabsList>

                        {/* Roadmap View */}
                        <TabsContent
                            value="roadmap"
                            className="m-0 h-[calc(100vh-3.5rem)]"
                        >
                            <FlowView
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

                        {/* Kanban View */}
                        <TabsContent 
                            value="kanban"
                            className="m-0 h-[calc(100vh-3.5rem)]"
                        >
                            <KanbanView />
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>

                {selectedNodeId != null && (
                    <>
                        <ResizableHandle withHandle />

                        <ResizablePanel
                            defaultSize={defaultLayout[1]}
                            minSize={30}
                            className="p-10 flex flex-col gap-4"
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

                {selectedTaskId != null && (
                    <>
                        <ResizableHandle withHandle />

                        <ResizablePanel
                            defaultSize={defaultLayout[1]}
                            minSize={30}
                            className="p-10 flex flex-col gap-4"
                        >
                            <TaskDetailsPanel 
                                milestones={milestones}
                                selectedTaskId={selectedTaskId}
                                handlePanelChange={handleTaskPanelChange}
                            />
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}

const TaskDetailsPanel = ({
    milestones,
    selectedTaskId,
    // milestoneId,
    // task,
    handlePanelChange
}: {
    milestones: any[]
    selectedTaskId: string
    // milestoneId: string
    // task: any
    handlePanelChange: (open: boolean) => void
}) => {
    // const [isEditing, setIsEditing] = useState(false)    // disabled while details view is disabled
    const [isEditing, setIsEditing] = useState(true)
    const task = milestones.map(milestone => milestone.tasks).flat(1).find(task => task?.id === selectedTaskId)
    // const milestone = milestones.find(milestone => milestone.tasks.includes(selectedTaskId))

    const handleClose = () => {
        // setIsEditing(false)
        handlePanelChange(false)
    }

    return (
        <>
            <span className="flex flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold grow">
                    {isEditing ? `Edit Task Details` : `Task Details`}
                </h1>
                {/* {isEditing ? (
                    <Button onClick={() => setIsEditing(false)}>
                        Cancel Editing
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>
                        Edit Task
                    </Button>
                )} */}
                <Button onClick={handleClose}>
                    <FaX />
                </Button>
            </span>
            {isEditing ? (
                <EditTaskForm 
                    taskData={task}
                    // onClose={() => setIsEditing(false)}
                    onClose={() => {}}
                />
            ) : (
                <TaskDetails taskData={task}/>
            )}
        </>
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
                <h1 className="text-2xl font-bold grow">
                    {isEditing ? `Edit Milestone Details` : `Milestone Details`}
                </h1>
                {/* {isEditing ? (
                    <Button onClick={() => setIsEditing(false)}>
                        Cancel Editing
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>
                        Edit Milestone
                    </Button>
                )} */}
                <Button onClick={handleClose}>
                    <FaX />
                </Button>
            </span>
            {isEditing ? (
                <EditMilestoneForm
                    milestoneData={milestone}
                    // onClose={() => setIsEditing(false)}
                    onClose={() => {}}
                />
            ) : (
                <MilestoneDetails milestoneData={milestone} />
            )}
        </>
    )
}
