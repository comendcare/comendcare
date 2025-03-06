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
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { GanttChartView } from "./gantt-chart"
import { getRoadmapId } from "@/lib/fetchers"
import { PrivateTimelineView } from "./private-timeline"
import { Button, buttonVariants } from "./ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { FaArrowUpRightFromSquare, FaFileImport, FaPlus } from "react-icons/fa6"
import { FaRedo, FaUndo } from "react-icons/fa"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import { DeleteMilestoneDialogContent } from "./delete-milestone-dialog-content"
import { MilestoneTemplateTabs } from "./roadmap-templates"
import { nanoid } from "nanoid"
import { useStoreApi, type Edge, type Node, type NodeChange } from "@xyflow/react"
import { Redo2, Undo2 } from "lucide-react"
import { FileUploadForm } from "./file-upload-form"
import Papa from "papaparse"
import { MILESTONE_TYPE_OPTIONS } from "@/lib/types"

const selector = (state: RoadmapState) => ({
    selectedView: state.selectedView,
    setSelectedView: state.setSelectedView,
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    nodes: state.nodes,
    milestones: state.milestones,
    saveState: state.saveState,
    addNodes: state.addNodes
})

export function Roadmap({data}: {data: any}) {
    // Zustand state management
    const { defaultLayout } = useSidebarStore()
    const { 
        selectedView,
        setSelectedView,
        selectedNodeId, 
        setSelectedNodeId, 
        nodes: dbNodes,
        milestones, 
        saveState,
        addNodes
    } = useRoadmapStore(useShallow(selector))
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { undo, redo } = useRoadmapStore.temporal.getState()
    const [milestoneRemountKey, setMilestoneRemountKey] = useState(1);
    const milestoneRemountKeyRef = useRef(milestoneRemountKey);
    const [bulkImportIsOpen, setBulkImportIsOpen] = useState(false);
    const [newMilestoneIsOpen, setNewMilestoneIsOpen] = useState(false)
    const [selectedMilestones, setSelectedMilestones] = useState<any[]>([])
    const store = useStoreApi()
    
    useEffect(() => {
        milestoneRemountKeyRef.current = milestoneRemountKey;  // Always sync ref with the latest state
    
        const handleUndoRedo = (event: KeyboardEvent) => {
            console.log(event)
            if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.key === "z") {
                console.log("Redo action triggered")
                redo() // undo updates zustand state
                saveState() // save state to update database

                if (selectedNodeId) {
                    // if there is a node selected, remount the milestone form
                    // to update the form data after the undo was triggered
                    setMilestoneRemountKey(prevKey => prevKey + 1)
                }

                return
            }
            if ((event.metaKey || event.ctrlKey) && event.key === "z") {
                console.log("Undo action triggered");
                undo(); // undo updates zustand state
                saveState(); // save state to update database
    
                if (selectedNodeId) {
                    // Remount the milestone form and update the milestoneRemountKey
                    // using the ref to get the most recent value
                    setMilestoneRemountKey(milestoneRemountKeyRef.current + 1);
                }
            }
        };
    
        document.addEventListener("keydown", handleUndoRedo);
        return () => document.removeEventListener("keydown", handleUndoRedo);
    }, [selectedNodeId, milestoneRemountKey]);

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

    // Add a empty milestone node
    // if a position is provided, place at the given coordinates
    // if a position is not provided, place in the center
    const addMilestones = async (newMilestones: any[]) => {
        const newNodes: any[] = []

        // get center of viewport: https://stackoverflow.com/questions/76349086/how-can-i-prevent-nodes-from-being-added-outside-the-view-area-in-react-flow
        const {
            height,
            width,
            transform: [transformX, transformY, zoomLevel]
        } = store.getState()

        const zoomMultiplier = 1 / zoomLevel
        const milestonesAlongXAxis = dbNodes.sort((a, b) => {
            return a.position.x - b.position.x
        })
        console.log(`milestones along XAxis`, milestonesAlongXAxis)
        // let centerX =
        //     -transformX * zoomMultiplier + (width * zoomMultiplier) / 2
        let centerX = milestonesAlongXAxis.length > 0 ? (
            milestonesAlongXAxis[milestonesAlongXAxis.length - 1].position.x + 500
        ): (
            0
        )
        // let centerY =
        //     -transformY * zoomMultiplier + (height * zoomMultiplier) / 2
        let centerY = 0

        newMilestones.forEach(defaultData => {
            const id = nanoid()
            const newNode: Node = {
                id: id,
                type: defaultData?.nodeType || defaultData?.node?.type || "PROJECT",
                position: {
                    x: centerX,
                    y: centerY
                },
                origin: [0.0, 0.0],
                data: {
                    id: nanoid(),
                    nodeId: id,
                    types: defaultData?.types || [],
                    title: defaultData?.title || `New Milestone`,
                    ...(defaultData?.description ? { description: defaultData.description } : undefined),
                    status: defaultData?.status || "PLANNED",
                    private: true
                }
            }

            centerX += 500
            // centerY += 200

            newNodes.push(newNode)
        })

        const nodes = await addNodes(newNodes)
        return nodes
    }

    return (
        <TooltipProvider delayDuration={0}>
            <ResizablePanelGroup
                direction="horizontal"
                className="h-full items-stretch"
            >
                <ResizablePanel>
                    <Tabs defaultValue={selectedView ? selectedView : "timeline"} onValueChange={handleTabChange} className="flex flex-col gap-4">
                        <div className="flex flex-row items-center m-1 p-1 gap-x-1 justify-start">
                            <TabsList>
                                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                                <TabsTrigger value="flow">Flow View</TabsTrigger>
                            </TabsList>

                            <Button variant={"cta"} className="research-plan-tour-step1 ml-auto" onClick={() => setNewMilestoneIsOpen(true)}>
                                <FaPlus />
                                Create milestone
                            </Button>
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => {
                                    router.push('/app/research-plan/templates')
                                }}
                            >
                                Browse milestone library
                            </Button>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button onClick={() => {
                                        console.log("Bulk import triggered")
                                        setBulkImportIsOpen(true)
                                    }} size={"icon"} variant={"ghost"}>
                                        <FaFileImport />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80">
                                    <p>{`Import milestones from .csv`}</p>
                                </TooltipContent>
                            </Tooltip>

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
                                        <Undo2 />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80">
                                    <p>{`Undo (⌘+Z)`}</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button onClick={() => {
                                        console.log("Redo action triggered")
                                        redo() // undo updates zustand state
                                        saveState() // save state to update database
                        
                                        if (selectedNodeId) {
                                            // if there is a node selected, remount the milestone form
                                            // to update the form data after the undo was triggered
                                            setMilestoneRemountKey(prevKey => prevKey + 1)
                                        }
                                    }} size={"icon"} variant={"ghost"}>
                                        <Redo2 />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80">
                                    <p>{`Redo (⌘+Shift+Z)`}</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={data?.organization?.subdomain ? `http://${data?.organization?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan` : "/"}
                                        className={cn(
                                            buttonVariants({ variant: "ghost" }),
                                            "flex items-center"
                                        )}
                                        target={"_blank"}
                                    >
                                        <FaArrowUpRightFromSquare size={12}/>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80">
                                    <p>{`View public research plan`}</p>
                                </TooltipContent>
                            </Tooltip>
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

                    </Tabs>
                </ResizablePanel>

                {selectedNodeId != null && (
                    <>
                        <ResizableHandle withHandle />

                        <ResizablePanel
                            defaultSize={40}
                            minSize={25}
                            className="bg-white h-full flex flex-col"
                        >
                            <MilestoneDetailsPanel
                                remountKey={milestoneRemountKey}
                                milestone={milestones.find(
                                    milestone =>
                                        milestone.nodeId === selectedNodeId
                                )}
                                handlePanelChange={handleMilestonePanelChange}
                            />
                        </ResizablePanel>
                    </>
                )}

                <Dialog open={bulkImportIsOpen} onOpenChange={(open: boolean) => {
                    setBulkImportIsOpen(open)
                }}>
                    {/* <DialogContent className="min-w-[80vw] h-[80vh] w-[80vw] flex flex-col justify-start"> */}
                    <DialogContent className="flex flex-col justify-start">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">
                                Import milestones
                            </DialogTitle>
                            <DialogDescription>
                                Import multiple milestones at a time. Fill out our milestone <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1C8yyYY_It4Mag9u7zcXFfZa2ITylqXcSz5GsFS2IdkE/edit?usp=sharing">input template</Link> and upload.
                            </DialogDescription>
                        </DialogHeader>

                        <FileUploadForm 
                            accept=".csv" 
                            onSubmit={(file) => {
                                if (file && file.name.endsWith(".csv")) {
                                    // parse CSV file
                                    Papa.parse(file, {
                                        complete: (result) => {
                                            console.log("Parsed file:", result.data)
                                            const newMilestones: any[] = []
                                            result.data.forEach((entry: any) => {
                                                // validate
                                                if (entry.title && entry.description && entry.types) {
                                                    newMilestones.push({
                                                        title: entry.title,
                                                        description: entry.description,
                                                        types: [MILESTONE_TYPE_OPTIONS.find(type => type.label === entry.types)?.value]
                                                    })
                                                } else {
                                                    console.error(`Invalid milestone type`, entry)
                                                }
                                            })

                                            console.log(`new milestones`, newMilestones)
                                            addMilestones(newMilestones)
                                        },
                                        header: true,
                                        skipEmptyLines: true,
                                    })
                                } else {
                                    console.error("Please upload a valid CSV file.");
                                }
                            }}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog open={newMilestoneIsOpen} onOpenChange={(open: boolean) => {
                    if (!open) setSelectedMilestones([])
                    setNewMilestoneIsOpen(open)
                }}>
                    <DialogContent className="min-w-[80vw] h-[80vh] w-[80vw] flex flex-col justify-start">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">
                                Select from a milestone template
                            </DialogTitle>
                            <DialogDescription>
                                {`Templates can help you find inspiration and get started faster. Click on a Milestone Template to add it to your Research Plan.`}
                            </DialogDescription>
                        </DialogHeader>
        
                        <MilestoneTemplateTabs 
                            selectedMilestones={selectedMilestones}
                            setSelectedMilestones={setSelectedMilestones}
                            createEmpty={() => addMilestones([{name: 'New Milestone'}])}
                            inDialog={true}
                        />
        
                        <DialogFooter>
                            <DialogClose>
                                <Button variant="secondary" type="button">
                                    Cancel
                                </Button>
                            </DialogClose>
        
                            <Button
                                variant="secondary"
                                type="button"
                                onClick={() => {
                                    router.push('/app/research-plan/templates')
                                }}
                            >
                                Browse milestone library
                            </Button>
                            
                            <DialogClose>
                                <Button
                                    disabled={selectedMilestones.length === 0}
                                    type="button"
                                    onClick={() => {
                                        console.log(`add milestones`, selectedMilestones)
                                        addMilestones(selectedMilestones)
                                    }}
                                >
                                    <FaPlus />
                                    Create selected milestones
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}

const MilestoneDetailsPanel = ({
    remountKey,
    milestone,
    handlePanelChange
}: {
    remountKey: number,
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
    }, [selectedNodeId, remountKey])

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
