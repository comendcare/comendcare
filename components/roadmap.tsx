"use client"

import * as React from "react";
import { useNavStore } from "@/state/nav/navStore"; // Zustand store
import { TooltipProvider } from "@/components/ui/tooltip";
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs";
import Flow from "@/components/flow";
import Kanban from "@/components/kanban";
import { PlateEditor } from "@/components/editor";
import { useState } from "react";
import { Button } from "./ui/button";
import { FaX } from "react-icons/fa6";

export function Roadmap() {
    // Zustand state management
    const { defaultLayout, setLayout } = useNavStore()
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

    const onNodeClick = (event: any, node: any) => {
        console.log(`Node Clicked`)
        setSelectedNodeId(node.id); // Update state with selected node ID
    }

    const handlePanelChange = (open: boolean) => {
        console.log(`Open Changed: ${open}`)
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
                {/* Middle Panel for Kanban and Roadmap */}
                <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
                    <Tabs defaultValue="roadmap">
                        <TabsList>
                            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                            <TabsTrigger value="kanban">Kanban</TabsTrigger>
                        </TabsList>
                        <TabsContent value="roadmap" className="m-0 h-[calc(100vh-3.5rem)]">
                            <Flow nodeClickCallback={onNodeClick}/>
                        </TabsContent>
                        <TabsContent value="kanban">
                            <Kanban />
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>

                {selectedNodeId != null && (
                    <>
                        <ResizableHandle withHandle />

                        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
                            <p>{`Selected Node: ${selectedNodeId}`}</p>
                            <Button onClick={() => handlePanelChange(false)}><FaX /></Button>
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </TooltipProvider>
    );
}
