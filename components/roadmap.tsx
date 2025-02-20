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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@/components/ui/tabs"
import { PrivateFlowView } from "@/components/private-flow"
import { EditMilestoneForm } from "./edit-milestone-form"
import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { GanttChartView } from "./gantt-chart"
import { getRoadmapId } from "@/lib/fetchers"
import { PrivateTimelineView } from "./private-timeline"
import { Button, buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { FaArrowUpRightFromSquare } from "react-icons/fa6"
import { FaUndo } from "react-icons/fa"

const selector = (state: RoadmapState) => ({
    selectedView: state.selectedView,
    setSelectedView: state.setSelectedView,
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    saveState: state.saveState
})

export function Roadmap({data}: {data: any}) {
    // Zustand state management
    const { defaultLayout } = useSidebarStore()
    const { 
        selectedView,
        setSelectedView,
        selectedNodeId, 
        setSelectedNodeId, 
        milestones, 
        saveState
    } = useRoadmapStore(useShallow(selector))
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { undo } = useRoadmapStore.temporal.getState()
    const [milestoneRemountKey, setMilestoneRemountKey] = useState(1)

    useEffect(() => {
        const handleUndo = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "z") {
                event.preventDefault(); // Prevent default undo behavior (optional)
                console.log("Undo action triggered")
                undo() // undo updates zustand state
                saveState() // save state to update database

                if (selectedNodeId) {
                    // if there is a node selected, remount the milestone form
                    // to update the form data after the undo was triggered
                    setMilestoneRemountKey(prevKey => prevKey + 1)
                }

                return
            }
        };
    
        document.addEventListener("keydown", handleUndo);
        return () => document.removeEventListener("keydown", handleUndo);
    }, []);

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

        // ensure shallow url update
        const url = params.size > 0 ? `${pathname}?${params}` : `${pathname}`
        window.history.replaceState({ ...window.history.state, as: url, url: url }, '', url)
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
                    <Tabs defaultValue={selectedView ? selectedView : "flow"} onValueChange={handleTabChange} className="flex flex-col gap-4">
                        <div className="flex flex-row items-center m-1 p-1 gap-x-1 justify-start">
                            <TabsList>
                                <TabsTrigger value="flow">Flow View</TabsTrigger>
                                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                                {/* <TabsTrigger value="gantt">Gantt Chart View</TabsTrigger> */}
                            </TabsList>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button onClick={() => {
                                        console.log("Undo action triggered")
                                        undo() // undo updates zustand state
                                        saveState() // save state to update database
                        
                                        if (selectedNodeId) {
                                            // if there is a node selected, remount the milestone form
                                            // to update the form data after the undo was triggered
                                            setMilestoneRemountKey(prevKey => prevKey + 1)
                                        }
                                    }} size={"icon"} variant={"ghost"}>
                                        <FaUndo />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80">
                                    <p>{`Undo`}</p>
                                </TooltipContent>
                            </Tooltip>

                            <Link
                                href={data?.organization?.subdomain ? `http://${data?.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan` : "/"}
                                className={cn(
                                    buttonVariants({ variant: "secondary" }),
                                    "flex items-center ml-auto"
                                )}
                                target={"_blank"}
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
                            className="mt-0 h-[calc(100vh-6rem)]"
                        >
                            <PrivateTimelineView />
                        </TabsContent>

                        {/* Gantt Chart View */}
                        {/* <TabsContent
                            value="gantt"
                            className="mt-0 h-[calc(100vh-3.5rem)]"
                        >
                            <GanttChartView />
                        </TabsContent> */}
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
                                key={milestoneRemountKey}
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
    key,
    milestone,
    handlePanelChange
}: {
    key: number,
    milestone: any
    handlePanelChange: (open: boolean) => void
}) => {
    const { 
        selectedNodeId, 
    } = useRoadmapStore(useShallow(selector))
    const [milestoneRemountKey, setMilestoneRemountKey] = useState(1)
    
    useEffect(() => {
        if (selectedNodeId) {
            // remount if the selected node has changed, this will re-initialize the form data
            // without closing the side panel since we're now editing a new node
            setMilestoneRemountKey(prevKey => prevKey + 1)
        }
    }, [selectedNodeId, key])

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
