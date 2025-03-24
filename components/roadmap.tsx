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
import { usePathname, useSearchParams } from "next/navigation"
import { getMilestoneTypes, getOrganizationFromOrganizationId } from "@/lib/fetchers"
import { PrivateTimelineView } from "./private-timeline"
import { Button, buttonVariants } from "./ui/button"
import { cn, sleep } from "@/lib/utils"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import { ExternalLink, Import, Info, Plus, Redo2, Undo2 } from "lucide-react"
import { FileUploadForm } from "./file-upload-form"
import Papa from "papaparse"
import { toast } from "sonner"
import Image from "next/image"
import { NewMilestoneDialogForm } from "./new-milestone-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Milestone, NodeType } from "@/lib/types"
import Loading from "@/app/loading"
import { MilestoneType } from "@prisma/client"
import { useSession } from "next-auth/react"

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    initialized: state.initialized,
    selectedView: state.selectedView,
    setSelectedView: state.setSelectedView,
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    saveState: state.saveState,
    addMilestones: state.addMilestones
})

export function Roadmap() {
    // Zustand state management
    const { defaultLayout } = useSidebarStore()
    const { 
        roadmapId,
        initialized,
        selectedView,
        setSelectedView,
        selectedNodeId, 
        setSelectedNodeId, 
        milestones, 
        saveState,
        addMilestones
    } = useRoadmapStore(useShallow(selector))
    const {data: session} = useSession()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { undo, redo } = useRoadmapStore.temporal.getState()
    const [milestoneRemountKey, setMilestoneRemountKey] = useState(1);
    const [bulkImportIsOpen, setBulkImportIsOpen] = useState(false);
    const [newMilestoneIsOpen, setNewMilestoneIsOpen] = useState(false)
    const [milestoneTypes, setMilestoneTypes] = useState<MilestoneType[]>([])
    const [sortBy, setSortBy] = useState('custom')
    const milestoneRemountKeyRef = useRef(milestoneRemountKey);
    const [orgSubdomain, setOrgSubdomain] = useState<string | undefined>()

    useEffect(() => {
        const init = async () => {
            // get milestone types from database
            const response = await getMilestoneTypes()
            if (response.success && response.data) {
                setMilestoneTypes(response.data || [])
            }

            await sleep(300)
            if (milestones.length <= 0 && initialized) setNewMilestoneIsOpen(true)

            if (session?.user.organizationId) {
                let orgData = await getOrganizationFromOrganizationId(session.user.organizationId)
                if (orgData.success && orgData.data) {
                    setOrgSubdomain(orgData.data.subdomain || undefined)
                }
            }
        }

        init()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }, [selectedNodeId, milestoneRemountKey, redo, undo, saveState]);

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
    }, [selectedNodeId, selectedView, pathname, searchParams])
    
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
                                        <TooltipTrigger asChild>
                                            <div className="ml-auto">
                                            <Info />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-80 text-wrap text-left">
                                            {"An interactive whiteboard that lets you easily view and organize research plans with visual elements."}
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
                                        <Plus />
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
                                        <Import />
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
                                <TooltipTrigger asChild disabled={!orgSubdomain}>
                                    <Link
                                        href={orgSubdomain ? `http://${orgSubdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan` : "/"}
                                        className={cn(
                                            buttonVariants({ variant: "ghost" }),
                                            "flex items-center w-[40px]"
                                        )}
                                        target={"_blank"}
                                    >
                                        <ExternalLink />
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
                                            try {
                                                const newMilestones: Partial<Milestone>[] = []

                                                const isValidFormat = (entry: any) => {
                                                    const errors = []
    
                                                    // only title is a required field
                                                    if (!(entry.title && typeof entry.title === "string")) {
                                                        errors.push({
                                                            type: "title",
                                                            message: "Field 'title' is not formatted properly"
                                                        })
                                                    }
    
                                                    if (errors.length > 0) return { isValid: false, errors: errors }
                                                    return { isValid: true }
                                                }
    
                                                let errors: {type: string, message: string}[] = []
                                                result.data.forEach((entry: any) => {
                                                    // validate milestone format
                                                    const validate = isValidFormat(entry)
                                                    if (validate.isValid && !validate.errors) {
                                                        const foundType = milestoneTypes.find(type => type.label === entry.type)
                                                        newMilestones.push({
                                                            title: entry.title || 'New Milestone',
                                                            description: entry.description || '', // description is optional
                                                            types: foundType ? [{milestoneTypeId: foundType.id, milestoneType: foundType}] : [], // types are optional
                                                            nodeType: entry.category === "RFP" || entry.category === "PROJECT" || entry.category === "ASSET" ? entry.category : "PROJECT" // category is optional, default to project
                                                        })
                                                    } else {
                                                        errors = errors.concat(validate.errors || [])
    
                                                        const foundType = milestoneTypes.find(type => type.label === entry.type)
                                                        // attempt to create anyways
                                                        newMilestones.push({
                                                            title: entry.title && typeof entry.title === 'string' ? entry.title : 'New milestone',
                                                            description: entry.description || '',
                                                            types: foundType ? [{milestoneTypeId: foundType.id, milestoneType: foundType}] : [],
                                                            nodeType: entry.category === "RFP" || entry.category === "PROJECT" || entry.category === "ASSET" ? entry.category : "PROJECT"
                                                        })
                                                    }
                                                })
    
                                                if (errors.length > 0) {
                                                    toast('Warning!', {
                                                        position: "bottom-left",
                                                        duration: 4000,
                                                        description: `Missing fields in import file: A title is required for each milestone. Please ensure all milestones have titles before importing.`
                                                    })
                                                    console.error("Error: imported milestones are missing required fields", errors)
                                                }
    
                                                addMilestones(newMilestones)
                                            } catch (e) {
                                                toast('Error!', {
                                                    position: "bottom-left",
                                                    duration: 4000,
                                                    description: `Import failed. Please try again. If the problem continues, contact us at support@comendcare.com`
                                                })
                                                console.error("Error: failed to import milestones", e)
                                            }
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
    milestone: Milestone | undefined
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

    if (milestone) {
        return (
            <EditMilestoneForm
                key={milestoneRemountKey}
                milestoneData={milestone}
                onClose={handleClose}
            />
        )
    }

    return <Loading />
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
                <Plus />
                Create milestone
            </Button>
        </div>
    )
}
