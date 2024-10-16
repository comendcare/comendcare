"use client"

import * as React from "react";
import { useNavStore } from "@/state/nav/navStore";
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore";
import { useShallow } from "zustand/react/shallow";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import Flow from "@/components/flow";
import Kanban from "@/components/kanban";
import { Button } from "./ui/button";
import { FaX } from "react-icons/fa6";
import { EditMilestoneForm } from "./edit-milestone-form";

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    nodes: state.nodes,
    milestones: state.milestones
})

export function Roadmap({ initNodes, initEdges, initMilestones }: { initNodes: any[], initEdges: any[], initMilestones: any[] }) {
    // Zustand state management
    const { defaultLayout, setLayout } = useNavStore()
    const { selectedNodeId, setSelectedNodeId, nodes, milestones } = useRoadmapStore( useShallow(selector) )

    const handlePanelChange = (open: boolean) => {
        if (!open) setSelectedNodeId(null)
    }

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    setLayout(sizes); // Use Zustand's setLayout to save panel sizes
                }}
                className="h-full items-stretch"
            >

                <ResizablePanel defaultSize={defaultLayout[0]} minSize={30}>
                    <Tabs defaultValue="roadmap">
                        <TabsList>
                            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                            <TabsTrigger value="kanban">Kanban</TabsTrigger>
                        </TabsList>

                        {/* Roadmap View */}
                        <TabsContent value="roadmap" className="m-0 h-[calc(100vh-3.5rem)]">
                            <Flow width={defaultLayout[0]} initNodes={initNodes} initEdges={initEdges} initMilestones={initMilestones}/>
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

                        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="p-10 flex flex-col gap-4">
                            <span className="flex flex-row justify-between items-center">
                                <h1 className="text-2xl font-bold">Edit Milestone Details</h1>
                                <Button onClick={() => handlePanelChange(false)}><FaX /></Button>
                            </span>
                            <EditMilestoneForm 
                                milestoneData={milestones.find(milestone => milestone.nodeId === selectedNodeId)}
                            />
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </TooltipProvider>
    );
}
