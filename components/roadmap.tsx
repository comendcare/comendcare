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
import { getMilestoneTypes, getRoadmapId } from "@/lib/fetchers"
import { PrivateTimelineView } from "./private-timeline"
import { Button, buttonVariants } from "./ui/button"
import { cn, sleep } from "@/lib/utils"
import Link from "next/link"
import { FaArrowUpRightFromSquare, FaFileImport, FaPlus } from "react-icons/fa6"
import { FaInfoCircle, FaRedo, FaUndo } from "react-icons/fa"
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
import { MilestoneTemplates, MilestoneTemplateTabs } from "./roadmap-templates"
import { nanoid } from "nanoid"
import { useStoreApi, type Edge, type Node, type NodeChange } from "@xyflow/react"
import { Redo2, Undo2 } from "lucide-react"
import { FileUploadForm } from "./file-upload-form"
import Papa from "papaparse"
import { toast } from "sonner"
import Loading from "@/app/loading"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Separator } from "@radix-ui/react-separator"
import { NewMilestoneDialogForm } from "./new-milestone-dialog"
import { MilestoneType } from "@prisma/client"
import { Option } from "@/lib/types"
import { CROSearchState, useCROSearchStore } from "@/state/search/croSearchStore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    initialized: state.initialized,
    selectedView: state.selectedView,
    setSelectedView: state.setSelectedView,
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    nodes: state.nodes,
    milestones: state.milestones,
    saveState: state.saveState,
    addMilestones: state.addMilestones
})

const recommendationsSelector = (state: CROSearchState) => ({
    recommendations: state.recommendations
})

export function Roadmap({data}: {data: any}) {
    // Zustand state management
    const { defaultLayout } = useSidebarStore()
    const { 
        roadmapId,
        initialized,
        selectedView,
        setSelectedView,
        selectedNodeId, 
        setSelectedNodeId, 
        nodes: dbNodes,
        milestones, 
        saveState,
        addMilestones
    } = useRoadmapStore(useShallow(selector))
    const { recommendations } = useCROSearchStore(useShallow(recommendationsSelector))
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { undo, redo } = useRoadmapStore.temporal.getState()
    const [milestoneRemountKey, setMilestoneRemountKey] = useState(1);
    const milestoneRemountKeyRef = useRef(milestoneRemountKey);
    const [bulkImportIsOpen, setBulkImportIsOpen] = useState(false);
    const [newMilestoneIsOpen, setNewMilestoneIsOpen] = useState(false)
    // const [selectedMilestones, setSelectedMilestones] = useState<any[]>([])
    const [selectedMilestoneTemplate, setSelectedMilestoneTemplate] = useState<string | undefined>()
    const store = useStoreApi()
    const [milestoneTypes, setMilestoneTypes] = useState<any[]>([])
    const [sortBy, setSortBy] = useState('custom')

    useEffect(() => {
        const init = async () => {
            // get milestone types from database
            const response = await getMilestoneTypes()
            if (response.success && response.data) {
                setMilestoneTypes(response.data || [])
            }

            await sleep(300)
            if (milestones.length <= 0 && initialized) setNewMilestoneIsOpen(true)
        }

        init()
    }, []);
    
    useEffect(() => {
        milestoneRemountKeyRef.current = milestoneRemountKey;  // Always sync ref with the latest state
    
        const handleUndoRedo = (event: KeyboardEvent) => {
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

    if (!roadmapId || !initialized) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <p>Research plan is not intialized... please refresh the page</p>
            </div>
        )
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
                            <TabsList className="mr-auto">
                                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                                <TabsTrigger value="flow" className="flex gap-2">
                                    Flow View
                                    <Tooltip>
                                        <TooltipTrigger className="ml-auto">
                                            <FaInfoCircle/>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-80 text-wrap text-left">
                                            {"Position of milestones in flow view is controlled manually via drag & drop."}
                                        </TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                            </TabsList>

                            {selectedView === "timeline" || selectedView === null && (
                                <div className="flex flex-row gap-4 items-center">
                                    <p>Sort by:</p>
                                    <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue defaultValue={'default'} placeholder={"Sort by"}/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom">{`Custom`}</SelectItem>
                                            <SelectItem value="start">{`Start Date`}</SelectItem>
                                            <SelectItem value="end">{`End Date`}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        size={"icon"} 
                                        variant={"cta"} 
                                        className="research-plan-tour-step1" 
                                        onClick={() => setNewMilestoneIsOpen(true)}
                                    >
                                        <FaPlus />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80">
                                    <p>{`Create a milestone`}</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        disabled={milestoneTypes.length === 0}
                                        onClick={() => {
                                            console.log("Bulk import triggered")
                                            setBulkImportIsOpen(true)
                                        }} 
                                        size={"icon"} 
                                        variant={"ghost"}
                                    >
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
                            {milestones.length > 0 ? (
                                <PrivateFlowView
                                    width={defaultLayout[0]}
                                />
                            ): (
                                <NoMilestonesCard setNewMilestoneIsOpen={setNewMilestoneIsOpen} />
                            )}
                        </TabsContent>
                        
                        {/* Timeline view */}
                        <TabsContent
                            value="timeline"
                            className="mt-0 h-[calc(100vh-6rem)]"
                        >
                            {milestones.length > 0 ? (
                                <PrivateTimelineView sortBy={sortBy}/>
                            ): (
                                <NoMilestonesCard setNewMilestoneIsOpen={setNewMilestoneIsOpen} />
                            )}
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
                                Import multiple milestones at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1C8yyYY_It4Mag9u7zcXFfZa2ITylqXcSz5GsFS2IdkE/edit?usp=sharing">Milestone input template</Link>, filling it out, downloading it as a CSV, and uploading it.
                            </DialogDescription>
                        </DialogHeader>

                        <FileUploadForm 
                            accept=".csv" 
                            onSubmit={(file) => {
                                if (file && file.name.endsWith(".csv")) {
                                    // parse CSV file
                                    Papa.parse(file, {
                                        complete: (result) => {
                                            const newMilestones: any[] = []

                                            const isValidFormat = (entry: any) => {
                                                const errors = []

                                                if (!(entry.title && typeof entry.title === "string")) {
                                                    errors.push({
                                                        type: "title",
                                                        message: "Field 'title' is not formatted properly"
                                                    })
                                                }

                                                // description is optional, so we don't check it

                                                if (!(entry.type && typeof entry.type === "string" || entry.type === null)) {
                                                    errors.push({
                                                        type: "type",
                                                        message: "Field 'type' is not formatted properly"
                                                    })
                                                }

                                                if (!(milestoneTypes.find(type => type.label === entry.type))) {
                                                    errors.push({
                                                        type: "type",
                                                        message: `Type ${entry.type} not found in database`
                                                    })
                                                }

                                                if (!(entry.category && typeof entry.category === "string")) {
                                                    errors.push({
                                                        type: "category",
                                                        message: "Field 'category' is not formated properly"
                                                    })
                                                }

                                                if (!(entry.category === "RFP" || entry.category === "PROJECT" || entry.category === "ASSET")) {
                                                    errors.push({
                                                        type: "category",
                                                        message: `Category ${entry.category} is not a valid category`
                                                    })
                                                }

                                                if (errors.length > 0) return { isValid: false, errors: errors }
                                                return { isValid: true }
                                            }

                                            let errors: {type: string, message: string}[] = []
                                            result.data.forEach((entry: any) => {
                                                // validate milestone format - don't include the milestone if it doesn't have all the
                                                // proper fields or if the fields are not of the correct type
                                                const validate = isValidFormat(entry)
                                                if (validate.isValid && !validate.errors) {
                                                    const foundType = milestoneTypes.find(type => type.label === entry.type)
                                                    newMilestones.push({
                                                        title: entry.title || 'New Milestone',
                                                        description: entry.description || '', // description is optional
                                                        types: foundType ? [foundType.milestoneTypeId || foundType.milestoneType?.id] : [],
                                                        nodeType: entry.category
                                                    })
                                                } else {
                                                    console.error(`Invalid milestone format`, entry);
                                                    (validate.errors || []).forEach((error: any) => {
                                                        console.error(`Format validation error: `, error.message)
                                                    })

                                                    errors = errors.concat(validate.errors || [])

                                                    const foundType = milestoneTypes.find(type => type.label === entry.type)
                                                    // attempt to create anyways
                                                    newMilestones.push({
                                                        title: entry.title && typeof entry.title === 'string' ? entry.title : 'New milestone',
                                                        description: '',
                                                        types: foundType ? [foundType.milestoneTypeId || foundType.milestoneType?.id] : [],
                                                        nodeType: entry.category === "RFP" || entry.category === "PROJECT" || entry.category === "ASSET" ? entry.category : "PROJECT"
                                                    })
                                                }
                                            })

                                            if (errors.length > 0) {
                                                toast('Error!', {
                                                    duration: 4000,
                                                    description: `Some milestones were not formatted properly. Some milestones have not been imported.`
                                                })
                                            }

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

                <NewMilestoneDialogForm 
                    open={newMilestoneIsOpen}
                    setOpen={setNewMilestoneIsOpen}
                />
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

const NoMilestonesCard = ({setNewMilestoneIsOpen}: {setNewMilestoneIsOpen: (val: boolean) => void}) => {
    return (
        <div className="h-full w-full flex flex-col justify-center items-center gap-4">
            <h1 className="font-cal text-4xl">You do not have any milestones</h1>
            <Image
                alt="missing milestones"
                src="https://illustrations.popsy.co/gray/graphic-design.svg"
                width={400}
                height={400}
            />
            <p className="text-lg text-stone-500">
                You do not have any milestones yet. Create one to get started.
            </p>
            <Button variant={"cta"} onClick={() => setNewMilestoneIsOpen(true)}>
                <FaPlus />
                Create milestone
            </Button>
        </div>
    )
}
