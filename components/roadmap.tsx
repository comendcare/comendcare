"use client"

import * as React from "react"
import { useNavStore } from "@/state/nav/navStore"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
    ResizablePanel,
    ResizablePanelGroup,
    ResizableHandle
} from "@/components/ui/resizable"
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs"
import Flow from "@/components/flow"
import Kanban from "@/components/kanban"
import { Button } from "./ui/button"
import { FaX } from "react-icons/fa6"
import { EditMilestoneForm } from "./edit-milestone-form"
import { useEffect, useState } from "react"
import { MilestoneDetails } from "./milestone-details"
import { EditTaskForm } from "./edit-task-form"

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    selectedTaskId: state.selectedTaskId,
    setSelectedTaskId: state.setSelectedTaskId,
    nodes: state.nodes,
    setNodes: state.setNodes,
    edges: state.edges,
    setEdges: state.setEdges,
    milestones: state.milestones,
    setMilestones: state.setMilestones
})

export function Roadmap({
    initNodes,
    initEdges,
    initMilestones,
    // initTasks
}: {
    initNodes: any[]
    initEdges: any[]
    initMilestones: any[]
    // initTasks: any[]
}) {
    // Zustand state management
    const { defaultLayout, setLayout } = useNavStore()
    const { 
        selectedNodeId, 
        setSelectedNodeId, 
        selectedTaskId, 
        setSelectedTaskId, 
        nodes, 
        setNodes, 
        edges, 
        setEdges, 
        milestones, 
        setMilestones 
    } = useRoadmapStore(useShallow(selector))

    const handleMilestonePanelChange = (open: boolean) => {
        if (!open) setSelectedNodeId(null)
        if (open) setSelectedTaskId(null)
    }

    const handleTaskPanelChange = (open: boolean) => {
        if (!open) setSelectedTaskId(null)
        if (open) setSelectedNodeId(null)
    }

    const handleTabChange = () => {
        // close all panels when switching tabs
        setSelectedNodeId(null)
        setSelectedTaskId(null)
    }

    useEffect(() => {
        setNodes(initNodes)
        setEdges(initEdges)
        setMilestones(initMilestones)
    }, [initNodes, initEdges])

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
                    <Tabs defaultValue="roadmap" onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                            <TabsTrigger value="kanban">Kanban</TabsTrigger>
                        </TabsList>

                        {/* Roadmap View */}
                        <TabsContent
                            value="roadmap"
                            className="m-0 h-[calc(100vh-3.5rem)]"
                        >
                            <Flow
                                width={defaultLayout[0]}
                            />
                        </TabsContent>

                        {/* Kanban View */}
                        <TabsContent value="kanban">
                            <Kanban />
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
                                // milestoneId={milestones.find(milestone => milestone?.tasks?.includes(selectedTaskId))}
                                // task={milestones.map(milestone => milestone?.tasks || []).flat(1).find(task => task.id === selectedTaskId)}
                                // task={tasks.find(task => 
                                //     task.id === selectedTaskId
                                // )}
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
    const [isEditing, setIsEditing] = useState(false)
    const task = milestones.map(milestone => milestone.tasks).flat(1).find(task => task?.id === selectedTaskId)
    // const milestone = milestones.find(milestone => milestone.tasks.includes(selectedTaskId))

    const handleClose = () => {
        setIsEditing(false)
        handlePanelChange(false)
    }

    return (
        <>
            <span className="flex flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold grow">
                    {isEditing ? `Edit Task Details` : `Task Details`}
                </h1>
                {isEditing ? (
                    <Button onClick={() => setIsEditing(false)}>
                        Cancel Editing
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>
                        Edit Task
                    </Button>
                )}
                <Button onClick={handleClose}>
                    <FaX />
                </Button>
            </span>
            {isEditing ? (
                <EditTaskForm 
                    // milestoneId={milestone.id}
                    taskData={task}
                    onClose={() => setIsEditing(false)}
                />
            ) : (
                // <MilestoneDetails milestoneData={milestone} />
                <div>{task?.name}</div>
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
    const [isEditing, setIsEditing] = useState(false)

    const handleClose = () => {
        setIsEditing(false)
        handlePanelChange(false)
    }

    return (
        <>
            <span className="flex flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold grow">
                    {isEditing ? `Edit Milestone Details` : `Milestone Details`}
                </h1>
                {isEditing ? (
                    <Button onClick={() => setIsEditing(false)}>
                        Cancel Editing
                    </Button>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>
                        Edit Milestone
                    </Button>
                )}
                <Button onClick={handleClose}>
                    <FaX />
                </Button>
            </span>
            {isEditing ? (
                <EditMilestoneForm
                    milestoneData={milestone}
                    onClose={() => setIsEditing(false)}
                />
            ) : (
                <MilestoneDetails milestoneData={milestone} />
            )}
        </>
    )
}
