"use client"

import * as React from "react";
import { useNavStore } from "@/state/nav/navStore"; // Zustand store
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import Flow from "@/components/flow";
import Kanban from "@/components/kanban";
import { useCallback, useState } from "react";
import { Button } from "./ui/button";
import { FaX } from "react-icons/fa6";
import { addEdge, MarkerType, Position, ReactFlowProvider, useEdgesState, useNodesState } from "@xyflow/react";
import EditMilestoneForm from "./edit-milestone-form";
import MilestoneStatusButton, { StatusType } from "./milestone-status-button";

const initNodes = [
    {
        id: '1',
        type: 'milestone',
        data: { 
            name: 'Basic Science - Disease',
            description: 'Complete the basic science for investigating our disease.',
            tasks: [
                { name: 'Literature search to undersand disease', complete: true }
            ],
            notes: '',
            status: 'done'
        },
        position: { x: 0, y: 0 },
        selected: false,
        selectable: true
    },
    {
        id: '2',
        type: 'milestone',
        data: { 
            name: 'Disease Models',
            description: 'Discover, construct, and phenotype disease models.',
            tasks: [
                { name: 'Identify the best models currently available', complete: true },
                { name: 'Construct Knock-in Mice', complete: true },
                { name: 'Phenotyping of Knock-in Mice', complete: false },
                { name: 'Construct Fibroblasts', complete: true },
                { name: 'Construct iPSCs', complete: true },
                { name: 'Phenotype iPSCs', complete: false }
            ],
            notes: '',
            status: 'inprogress'
        },
        position: { x: 600, y: 0 },
        selected: false,
        selectable: true
    },
    {
        id: '3',
        type: 'milestone',
        data: { 
            name: 'Pre-Clinical Design',
            description: 'Pre-clinical design and production.',
            tasks: [
                { name: 'Construct design', complete: false },
                { name: 'Plasmid production', complete: false },
                { name: 'AAV Production', complete: false},
            ],
            notes: 'Here are some extra notes as an example...',
            status: 'todo'
        },
        position: { x: 1200, y: 0 },
        selected: false,
        selectable: true
    }
]

const initEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }
    },
    {
        id: 'e2-3',
        source: '2',
        target: '3',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 }
    },
]


export function Roadmap() {
    // Zustand state management
    const { defaultLayout, setLayout } = useNavStore()
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)

    const handlePanelChange = (open: boolean) => {
        if (!open) setSelectedNodeId(null)
    }

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [],
    )

    // const newNode = () => {
    //     const id = (nodes.length + 1).toString()
    //     const newNode = {
    //         id,
    //         type: 'milestone',
    //         position: { x: 0, y: 400 },
    //         data: {
    //             name: `Node ${id}`,
    //             description: '',
    //             tasks: [],
    //             notes: '',
    //             status: 'todo'
    //         },
    //         selected: false,
    //         selectable: true
    //       };

    //       setNodes((nodes) => nodes.concat(newNode))
    // }

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                onLayout={(sizes: number[]) => {
                    setLayout(sizes); // Use Zustand's setLayout to save panel sizes
                }}
                className="h-full items-stretch"
            >

                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    <Tabs defaultValue="roadmap">
                        <TabsList>
                            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                            <TabsTrigger value="kanban">Kanban</TabsTrigger>
                        </TabsList>
                        <TabsContent value="roadmap" className="m-0 h-[calc(100vh-3.5rem)]">
                            <ReactFlowProvider>
                                <Flow 
                                    selectedNodeId={selectedNodeId}
                                    nodes={nodes}
                                    edges={edges}
                                    onConnect={onConnect}
                                    // newNode={newNode}
                                    setNodes={setNodes}
                                    setEdges={setEdges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    width={defaultLayout[0]} 
                                    setSelectedNodeId={setSelectedNodeId}
                                />
                            </ReactFlowProvider>
                        </TabsContent>
                        <TabsContent value="kanban">
                            <Kanban />
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>

                {selectedNodeId != null && (
                    <>
                        <ResizableHandle withHandle />

                        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30} className="p-10 flex flex-col gap-4">
                            <span className="flex flex-row justify-between">
                                <MilestoneStatusButton milestoneStatus={nodes.find(node => node.id === selectedNodeId)?.data?.status as StatusType} />
                                <Button onClick={() => handlePanelChange(false)}><FaX /></Button>
                            </span>
                            <EditMilestoneForm nodeData={nodes.find(node => node.id === selectedNodeId)?.data}/>
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </TooltipProvider>
    );
}
