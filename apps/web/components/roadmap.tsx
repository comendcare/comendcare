"use client"

import * as React from "react"
import { useSidebarStore } from "@/state/nav/navStore"
import { RoadmapState, useRoadmapStore } from "~web/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import {
    ResizablePanel,
    ResizablePanelGroup,
    ResizableHandle
} from "@comend/components/ui/resizable"
import { Tooltip, TooltipContent, TooltipTrigger } from "@comend/components/ui/tooltip";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@comend/components/ui/tabs"
import { PrivateFlowView } from "~web/components/private-flow"
import { EditMilestoneForm } from "./edit-milestone-form"
import {useEffect, useMemo, useRef, useState} from "react"
import { usePathname } from "next/navigation"
import { TimelineView } from "./private-timeline"
import { Button } from "@comend/components/ui/button"
import { cn } from "@comend/lib/utils"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@comend/components/ui/dialog"
import { CircleCheckBig, Globe, Info, LayoutTemplate, Lock, Pencil, Plus, Redo2, RefreshCcw, Share, Undo2, Wand2 } from "lucide-react"
import Image from "next/image"
import { NewMilestoneDialogForm, TabType } from "./new-milestone-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@comend/components/ui/select"
import { Milestone, RESEARCH_STAGE } from "@comend/lib/types"
import Loading from "./../../../loading";
import { Biosample, DiseaseModel, MilestoneType, Organization, RFP, Roadmap as RoadmapType, Tool } from "@prisma/client"
import { useSession } from "next-auth/react"
import { EditResearchPlanForm } from "./edit-research-plan-form"
import { StageOfActivityBadge } from "./public-roadmap-card"
import { Separator } from "@comend/components/ui/separator"
import ShareDialog from "./share-dialog"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@comend/components/ui/context-menu"
import {initializeRoadmapState} from "@comend/lib/initialize-client-state";
import { ProjectBulkImportDialog } from "./project-bulk-import-dialog"
import { Badge } from "@comend/components/ui/badge"

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    details: state.details,
    initialized: state.initialized,
    selectedView: state.selectedView,
    setSelectedView: state.setSelectedView,
    selectedNodeIds: state.selectedNodeIds,
    setSelectedNodeIds: state.setSelectedNodeIds,
    milestones: state.milestones,
    // saveState: state.saveState,
    addMilestones: state.addMilestones,
    deleteNode: state.deleteNode,
    setMilestone: state.setMilestone,
    savingList: state.savingList,
    setMilestonesVisibility: state.setMilestonesVisibility,
})

export function Roadmap({
    milestoneTypes,
    organization,
    orgSubdomain,
    orgIsPublished,
    researchPlanId,
    initRoadmap,
    initEdges,
    initNodes,
    initMilestones,
    biosampleOptions,
    diseaseModelOptions,
    clinicalDatasetOptions,
    rfpOptions,
    urlNode,
    urlView,
}: {
    milestoneTypes: MilestoneType[];
    organization?: Organization;
    orgSubdomain?: string;
    orgIsPublished: boolean;
    researchPlanId: string;
    initRoadmap: any;
    initEdges: any[];
    initNodes: any[];
    initMilestones: any[];
    biosampleOptions: Partial<Biosample>[];
    diseaseModelOptions: Partial<DiseaseModel>[];
    clinicalDatasetOptions: Partial<Tool>[];
    rfpOptions: Partial<RFP>[];
    urlNode: string | string[] | undefined;
    urlView: string | string[] | undefined;
}) {
    const { defaultLayout } = useSidebarStore()
    const { 
        roadmapId,
        details,
        selectedView,
        setSelectedView,
        selectedNodeIds, 
        setSelectedNodeIds, 
        milestones, 
        deleteNode,
        setMilestone,
        savingList,
        setMilestonesVisibility,
    } = useRoadmapStore(useShallow(selector))
    const {data: session, status} = useSession()
    const pathname = usePathname()
    const [milestoneRemountKey, setMilestoneRemountKey] = useState(1)
    // const [bulkImportIsOpen, setBulkImportIsOpen] = useState(false)
    const [newMilestoneIsOpen, setNewMilestoneIsOpen] = useState(false)
    // controlling tabs in this upper level so we can manually control which tab is selected, based on which trigger button is clicked
    const [tab, setTab] = useState<TabType>("projects")
    // const [sortBy, setSortBy] = useState('custom')
    const [sortBy, setSortBy] = useState("default")
    const milestoneRemountKeyRef = useRef(milestoneRemountKey);
    const contextMenuRef = useRef<HTMLDivElement>(null)
    const [deleteIsOpen, setDeleteIsOpen] = useState(false)

    useEffect(() => {
        // Don’t call the API until we know the session status
        if (status !== "authenticated") return

        const orgId = session?.user.organizationId
        if (!orgId) {
            // If you WANT a toast only when the user is actually authenticated but missing an org:
            // toast.error("You’re signed in but not part of an organization.")
            return
        }

        initializeRoadmapState({
            roadmapId: researchPlanId,
            details: initRoadmap,
            nodes: initNodes || [],
            edges: initEdges || [],
            milestones: initMilestones || [],
            selectedView: (() => {
                if (typeof urlView === 'string') return urlView
                return undefined
            })(),
            selectedNodeIds: (() => {
                if (typeof urlNode === 'string') return [urlNode]
                if (Array.isArray(urlNode)) return urlNode
                return []
            })(),
        })
    }, [status, session?.user.organizationId, researchPlanId])

    // useEffect(() => {
    //     milestoneRemountKeyRef.current = milestoneRemountKey;  // Always sync ref with the latest state
    
    //     const handleUndoRedo = (event: KeyboardEvent) => {
    //         if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.key === "z") {
    //             console.log("Redo action triggered")
    //             redo() // undo updates zustand state
    //             saveState() // save state to update database

    //             if (selectedNodeIds.length === 1 && selectedNodeIds[0]) {
    //                 // if there is a node selected, remount the milestone form
    //                 // to update the form data after the undo was triggered
    //                 setMilestoneRemountKey(prevKey => prevKey + 1)
    //             }

    //             return
    //         }
    //         if ((event.metaKey || event.ctrlKey) && event.key === "z") {
    //             console.log("Undo action triggered");
    //             undo(); // undo updates zustand state
    //             saveState(); // save state to update database
    
    //             if (selectedNodeIds.length === 1 && selectedNodeIds[0]) {
    //                 // Remount the milestone form and update the milestoneRemountKey
    //                 // using the ref to get the most recent value
    //                 setMilestoneRemountKey(milestoneRemountKeyRef.current + 1);
    //             }
    //         }
    //     };
    
    //     document.addEventListener("keydown", handleUndoRedo);
    //     return () => document.removeEventListener("keydown", handleUndoRedo);
    // }, [selectedNodeIds, milestoneRemountKey, redo, undo, saveState]);

    useEffect(() => {
        const params = new URLSearchParams()

        if (selectedNodeIds.length === 1 && selectedNodeIds[0]) {
            params.set("project", selectedNodeIds[0])
        } else {
            params.delete("project")
        }

        if (selectedView) {
            params.set("view", selectedView)
        } else {
            params.delete("view")
        }

        // ensure shallow url update
        const url = params.size > 0 ? `${pathname}?${params}` : `${pathname}`
        window.history.replaceState({ ...window.history.state, as: url, url: url }, '', url)
    }, [selectedNodeIds, selectedView, pathname])
    
    const handleMilestonePanelChange = (open: boolean) => {
        if (!open) { setSelectedNodeIds([]) }
    }

    const handleTabChange = (value: string) => {
        setSelectedView(value)
        setSelectedNodeIds([]) // deselect any selected milestones when switching tabs
    }
    
    function closeContextMenu() {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
    }

    if (!roadmapId) {
        return <Loading />
    }

    return (
        <ContextMenu>
        <ContextMenuTrigger autoFocus className="h-full w-full">
            <ResizablePanelGroup
                direction="horizontal"
                className="h-full items-stretch"
            >
                <ResizablePanel className="p-2 flex flex-col gap-2">
                    <RoadmapHeader 
                        researchPlanId={roadmapId}
                        researchPlanDetails={{
                            id: roadmapId,
                            ...details
                        }}
                        setTab={setTab}
                        setNewMilestoneIsOpen={setNewMilestoneIsOpen}
                        milestoneTypes={milestoneTypes}
                        // setBulkImportIsOpen={setBulkImportIsOpen}
                        orgSubdomain={orgSubdomain}
                    />
                    <Tabs defaultValue={selectedView ? selectedView : "flow"} onValueChange={handleTabChange} className="flex flex-col gap-4">
                        <div className="flex flex-row items-center gap-x-1 justify-start">
                            <div className="flex gap-2">
                            <TabsList className="mr-auto">
                                <TabsTrigger value="flow" className="relative">
                                    Flow view
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="ml-2">
                                            <Info className="h-4 w-4"/>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-80 text-wrap text-left" side="bottom">
                                            {"Interactive whiteboard. Changes made here or in the list view update both."}
                                        </TooltipContent>
                                    </Tooltip>
                                </TabsTrigger>
                                <TabsTrigger value="list">List view</TabsTrigger>
                            </TabsList>
                            {savingList.length > 0 && <p className="flex gap-1 items-center"><RefreshCcw className="h-4 w-4"/> Saving...</p>}
                            {/* {savingState === 'saved' && <p className="flex gap-1 items-center"><CircleCheckBig className="h-4 w-4"/> Saved</p>} */}
                            </div>

                            {selectedView === "list" && (
                                <div className="w-full flex gap-4 items-center justify-end">
                                    <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue 
                                                // defaultValue={'custom'} 
                                                defaultValue={'default'}
                                                placeholder={"Sort by"}
                                            >
                                                {(() => {
                                                    switch(sortBy) {
                                                        case "start":
                                                            return "Sort by: start date"
                                                        case "end":
                                                            return "Sort by: end date"
                                                        // default:
                                                        //     return "Sort by: custom"
                                                        default:
                                                            return "Sort by: default"
                                                    }
                                                })()}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* <SelectItem value="custom">{`Custom`}</SelectItem> */}
                                            <SelectItem value="default">{`Default`}</SelectItem>
                                            <SelectItem value="start">{`Start date`}</SelectItem>
                                            <SelectItem value="end">{`End date`}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        data-skip-outside-click
                                        onClick={(e) => {
                                            undo() // undo updates zustand state
                                            saveState() // save state to update database
                            
                                            if (selectedNodeIds.length === 1 && selectedNodeIds[0]) {
                                                // if there is a node selected, remount the milestone form
                                                // to update the form data after the undo was triggered
                                                setMilestoneRemountKey(prevKey => prevKey + 1)
                                            }
                                        }} size={"icon"} variant={"ghost"}
                                    >
                                        <Undo2 />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80">
                                    <p>{`Undo (⌘+Z)`}</p>
                                </TooltipContent>
                            </Tooltip> */}

                            {/* <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button onClick={() => {
                                        console.log("Redo action triggered")
                                        redo() // undo updates zustand state
                                        saveState() // save state to update database
                        
                                        if (selectedNodeIds.length === 1 && selectedNodeIds[0]) {
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
                            </Tooltip> */}
                        </div>

                        {/* Flow view */}
                        <TabsContent
                            value="flow"
                            className="m-0 h-[calc(100vh-10rem)]"
                        >
                            {milestones.length > 0 ? (
                                <PrivateFlowView
                                    width={defaultLayout[0]}
                                    organization={organization}
                                    contextMenuRef={contextMenuRef} 
                                />
                            ): (
                                <NoMilestonesCard setNewMilestoneIsOpen={setNewMilestoneIsOpen} setTab={setTab}/>
                            )}
                        </TabsContent>
                        
                        {/* List view */}
                        <TabsContent
                            value="list"
                            className="mt-0 h-[calc(100vh-12rem)]"
                        >
                            {milestones.length > 0 ? (
                                <TimelineView
                                    sortBy={sortBy} 
                                    organization={organization}
                                    contextMenuRef={contextMenuRef} 
                                />
                            ): (
                                <NoMilestonesCard setNewMilestoneIsOpen={setNewMilestoneIsOpen} setTab={setTab}/>
                            )}
                        </TabsContent>

                    </Tabs>
                </ResizablePanel>

                {selectedNodeIds.length === 1 && selectedNodeIds[0] != null && (
                    <>
                        <ResizableHandle withHandle />

                        <ResizablePanel
                            // onClick={(e) => {e.stopPropagation(); e.preventDefault()}}
                            defaultSize={40}
                            minSize={25}
                            className="bg-white h-full flex flex-col min-w-[400px] onborda-editing-project-details"
                        >
                            <MilestoneDetailsPanel
                                organization={organization}
                                remountKey={milestoneRemountKey}
                                milestone={milestones.find(
                                    milestone =>
                                        milestone.nodeId === selectedNodeIds[0]
                                )}
                                handlePanelChange={handleMilestonePanelChange}
                                orgIsPublished={orgIsPublished}
                                biosampleOptions={biosampleOptions}
                                diseaseModelOptions={diseaseModelOptions}
                                clinicalDatasetOptions={clinicalDatasetOptions}
                                rfpOptions={rfpOptions}
                                milestoneTypeOptions={milestoneTypes}
                            />
                        </ResizablePanel>
                    </>
                )}

                {/* <Dialog open={bulkImportIsOpen} onOpenChange={(open: boolean) => {
                    setBulkImportIsOpen(open)
                }}>
                    <DialogContent className="flex flex-col justify-start">
                        <DialogHeader>
                            <DialogTitle className="text-2xl">
                                Import projects
                            </DialogTitle>
                            <DialogDescription>
                                Import multiple projects at a time. Start by making a copy of our <Link target={"_blank"} className="underline text-blue-dark" href="https://docs.google.com/spreadsheets/d/1C8yyYY_It4Mag9u7zcXFfZa2ITylqXcSz5GsFS2IdkE/edit?usp=sharing">Project input template</Link>, filling it out, downloading it as a CSV, and uploading it.
                            </DialogDescription>
                        </DialogHeader>

                        <FileUploadForm 
                            accept=".csv" 
                            onSubmit={async (file) => {
                                if (file && file.name.endsWith(".csv")) {
                                    // parse CSV file
                                    try {
                                        const result = await parseCSV(
                                            file,
                                            [
                                                {key: 'title', required: true, defaultValue: 'Untitled Milestone', isValid: (entry) => typeof entry === 'string' && entry.length > 0},
                                                {key: 'description', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string'},
                                                {key: 'type', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string' && (milestoneTypes || []).find(type => type.label === entry) !== undefined}
                                            ]
                                        )

                                        if (milestoneTypes.length === 0) {
                                            toast('Warning!', {
                                                position: "bottom-left",
                                                duration: 6000,
                                                description: `Could not find the type for one or more of your imported projects. Projects may be imported without the proper types.`
                                            })
                                        } else if (result.errors.length > 0) {
                                            toast('Warning!', {
                                                position: "bottom-left",
                                                duration: 6000,
                                                description: `Missing fields in import file: A title is required for each project. Edit the Project to add title.`
                                            })
                                            console.error("Error: imported projects are missing required fields", result.errors)
                                        }

                                        const newNodes = await addMilestones(result.values.map(milestone => {
                                            const foundType = milestoneTypes.find(type => type.label === milestone.type)

                                            return {
                                                title: milestone.title, 
                                                description: milestone.description, 
                                                types: foundType ? [{milestoneTypeId: foundType.id, milestoneType: foundType}] : [],
                                                nodeType: "PROJECT"
                                            }
                                        }), "Import")

                                        if (newNodes) setSelectedNodeIds(newNodes.map(node => node.id))
                                    } catch (e) {
                                        toast('Error!', {
                                            position: "bottom-left",
                                            duration: 6000,
                                            description: `Import failed. Please try again to upload using a copy of our template. If the problem continues, contact us at support@comendcare.com`
                                        })
                                        console.error("Error: failed to import tools", e)
                                    }
                                } else {
                                    console.error("Please upload a valid CSV file.");
                                }
                            }}
                        />
                    </DialogContent>
                </Dialog> */}

                <NewMilestoneDialogForm 
                    open={newMilestoneIsOpen}
                    setOpen={setNewMilestoneIsOpen}
                    tab={tab}
                    setTab={setTab}
                />
            </ResizablePanelGroup>
        </ContextMenuTrigger>

        <ContextMenuContent ref={contextMenuRef}>
            <ContextMenuItem 
                onSelect={(e) => {
                    const selectedMilestones = milestones.filter(milestone => milestone.nodeId && selectedNodeIds.includes(milestone.nodeId))
                    setMilestonesVisibility(selectedMilestones, false)
                }}
            >
                {`Make selected project(s) public`}
            </ContextMenuItem>
            <ContextMenuItem
                onSelect={(e) => {
                    const selectedMilestones = milestones.filter(milestone => milestone.nodeId && selectedNodeIds.includes(milestone.nodeId))
                    setMilestonesVisibility(selectedMilestones, true)
                }}
            >
                {`Make selected project(s) private`}
            </ContextMenuItem>
            <ContextMenuItem onClick={(e) => {
                e.preventDefault()
                // we have to ensure the context menu closes properly before triggering the dialog
                // the context menu sets aria-hidden = true on itself for accessibility reasons, and this
                // causes the focused element to be hidden when the dialog is opened
                closeContextMenu()
                setTimeout(() => setDeleteIsOpen(true), 10) // let context menu close after a brief delay
            }}>
                Delete Selected Projects
            </ContextMenuItem>
        </ContextMenuContent>

        <Dialog open={deleteIsOpen} onOpenChange={setDeleteIsOpen}>
            <DialogContent ref={contextMenuRef}>
                <DialogHeader>
                    <DialogTitle>
                        Are you absolutely sure?
                    </DialogTitle>
                    <DialogDescription>
                        {`This action cannot be undone. This will permanently delete the selected projects and their data.`}
                    </DialogDescription>
                    <DialogFooter>
                        <DialogClose>
                            <Button type="button" onClick={(e) => {
                                e.preventDefault()
                                document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))
                                setDeleteIsOpen(false)
                            }}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <DialogClose>
                            <Button
                                type="button"
                                variant={"destructive"}
                                onClick={async (e) => {
                                    e.preventDefault()
                                    setDeleteIsOpen(false)
                                    await Promise.all(selectedNodeIds.map(async (nodeId: string) => await deleteNode(nodeId)))
                                }}
                            >
                                Delete Selected Projects
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
        </ContextMenu>
    )
}

const MilestoneDetailsPanel = ({
    organization,
    remountKey,
    milestone,
    orgIsPublished,
    biosampleOptions,
    diseaseModelOptions,
    clinicalDatasetOptions,
    rfpOptions,
    milestoneTypeOptions,
    handlePanelChange,
    className,
}: {
    organization: Organization | undefined,
    remountKey: number,
    milestone: Milestone | undefined
    orgIsPublished: boolean,
    biosampleOptions: Partial<Biosample>[],
    diseaseModelOptions: Partial<DiseaseModel>[],
    clinicalDatasetOptions: Partial<Tool>[],
    rfpOptions: Partial<RFP>[],
    milestoneTypeOptions: Partial<MilestoneType>[],
    handlePanelChange: (open: boolean) => void,
    className?: string,
}) => {
    const { 
        selectedNodeIds, 
    } = useRoadmapStore(useShallow(selector))
    const [milestoneRemountKey, setMilestoneRemountKey] = useState(1)
    
    useEffect(() => {
        if (selectedNodeIds) {
            // remount if the selected node has changed, this will re-initialize the form data
            // without closing the side panel since we're now editing a new node
            setMilestoneRemountKey(prevKey => prevKey + 1)
        }
    }, [selectedNodeIds, remountKey])

    const handleClose = () => {
        handlePanelChange(false)
    }

    if (milestone) {
        return (
            <EditMilestoneForm
                organization={organization}
                key={milestoneRemountKey}
                milestoneData={milestone}
                orgIsPublished={orgIsPublished}
                biosampleOptions={biosampleOptions}
                diseaseModelOptions={diseaseModelOptions}
                clinicalDatasetOptions={clinicalDatasetOptions}
                rfpOptions={rfpOptions}
                milestoneTypeOptions={milestoneTypeOptions}
                onClose={handleClose}
                className={className}
            />
        )
    }

    return <Loading />
}

const NoMilestonesCard = ({setNewMilestoneIsOpen, setTab}: {setNewMilestoneIsOpen: (val: boolean) => void, setTab: (val: TabType) => void}) => {
    const pathname = usePathname()
    const { setSelectedNodeIds } = useRoadmapStore(useShallow(selector))

    return (
        <div className="h-full w-full flex flex-col justify-center items-center gap-4 text-center">
            <h1 className="font-cal text-4xl">Your research plan is empty!</h1>
            <Image
                alt="No projects"
                src="https://illustrations.popsy.co/gray/graphic-design.svg"
                width={300}
                height={300}
            />
            <p className="text-lg text-stone-500 max-w-xl">
                {`
                    Your research plan doesn't have any projects!
                    A project is a milestone in your research plan that is being planned or developed. You may attach Tools and RFPs to projects. 
                `} 
            </p>
            <span className="flex gap-4">

            <Button 
                variant={"cta"}  
                onClick={() => {
                    setTab('research-plans')
                    setNewMilestoneIsOpen(true)
                }}
                className="relative"
                style={
                    {
                        "--pulse-color": "#0096ff",
                        // "--pulse-color": "#dcebfe", // light blue
                        "--duration": "1.5s",
                    } as React.CSSProperties
                }
            >
                <div className="relative z-10 flex gap-2 items-center">
                    Add Projects
                </div>
                <div className={cn("absolute left-1/2 top-1/2 size-full -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-lg bg-inherit")} />
            </Button>
            </span>
        </div>
    )
}

const RoadmapHeader = ({
    researchPlanId,
    researchPlanDetails, 
    setTab, 
    setNewMilestoneIsOpen, 
    milestoneTypes, 
    // setBulkImportIsOpen,
    orgSubdomain
}: {
    researchPlanId: string,
    researchPlanDetails: Partial<RoadmapType>, 
    setTab: any, 
    setNewMilestoneIsOpen: any, 
    milestoneTypes: any, 
    // setBulkImportIsOpen: any,
    orgSubdomain: string | undefined
}) => {
    const {data: session, status} = useSession()
    const { milestones, setSelectedNodeIds, addMilestones, setMilestone, setMilestonesVisibility } = useRoadmapStore(useShallow(selector))
    const parentRef = useRef<HTMLDivElement>(null)
    const [parentWidth, setParentWidth] = useState(0)
    const [isCollapsed, setIsCollapsed] = useState(parentWidth <= 1024)
    const [editResearchPlanIsOpen, setEditResearchPlanIsOpen] = useState(false)
    const [shareIsOpen, setShareIsOpen] = useState(false)

    console.log(`research plan header data`, researchPlanDetails)

    useEffect(() => {
        const el = parentRef.current;
        if (!el) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry?.contentRect) {
            setParentWidth(entry.contentRect.width);
            }
        });

        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setIsCollapsed(parentWidth <= 1024)
    }, [parentWidth])

    const handleShare = async () => {
        // override default delete behaviour with our custom dialog
        setShareIsOpen(true)
    }

    return (
        <>
        <div ref={parentRef} className="flex justify-between items-center">
            <span className="flex flex-row items-center">
                <div className="w-full">
                    <h1 className="text-2xl font-semibold text-wrap line-clamp-2 pr-1">{researchPlanDetails.title || "Untitled Research Plan"}</h1>
                    {researchPlanDetails.description && (<p className="text-wrap line-clamp-2 text-muted-foreground text-sm">{researchPlanDetails.description}</p>)}
                </div>
                <Button
                    onClick={() => setEditResearchPlanIsOpen(true)} 
                    variant="ghost"
                    size={"icon"}
                    className="min-w-[40px]"
                >
                    <Pencil />
                </Button>
                <div className="p-[6px] h-[40px]">
                    {RESEARCH_STAGE.filter(stage => researchPlanDetails.stages?.includes(stage.value)).map(stage => (
                        <Badge variant={'secondary'} className="text-sm">{stage.label}</Badge>
                    ))}
                </div>
                {milestones.filter(milestone => !milestone.private).length <= 0 
                    ? (
                        <Tooltip>
                            <div className="p-[6px] h-[40px] w-[40px] min-w-[40px]">
                                <TooltipTrigger asChild>
                                    <Button
                                        className="h-full w-full rounded-md flex justify-center items-center bg-red-100 hover:bg-red-300"
                                        onClick={() => {
                                            setMilestonesVisibility(milestones, false)
                                        }}
                                    >
                                        <Lock className="text-red-600 h-4 w-4"/>
                                    </Button>
                                </TooltipTrigger>
                            </div>
                            <TooltipContent className="max-w-80">
                                {`Private research plans cannot be shared externally. Click to publish all projects.`}
                            </TooltipContent>
                        </Tooltip>
                    )
                    : (
                        <Tooltip>
                            <div className="p-[6px] h-[40px] w-[40px] min-w-[40px]">
                                <TooltipTrigger asChild>
                                    <Button
                                        className="h-full w-full rounded-md flex justify-center items-center bg-green-100 hover:bg-green-300"
                                        onClick={() => {
                                            setMilestonesVisibility(milestones, true)
                                        }}
                                    >
                                        <Globe className="text-green-600 h-4 w-4"/>
                                    </Button>
                                </TooltipTrigger>
                            </div>
                            <TooltipContent className="max-w-80">
                                {`Published research plans can be shared externally. Click to make all projects private.`}
                            </TooltipContent>
                        </Tooltip>
                    )
                }
            </span>

            <span className="flex flex-row items-center justify-end">
                {/* <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            onClick={() => {
                                console.log("Bulk import triggered")
                                setBulkImportIsOpen(true)
                            }} 
                            variant={"ghost"}
                            size={isCollapsed ? "icon" : "default"}
                        >
                            <Import />
                            {!isCollapsed && <p>{`Import projects`}</p>}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80">
                        <p>{`Import projects from a .csv file`}</p>
                    </TooltipContent>
                </Tooltip> */}

                {/* <Button 
                    variant={"ghost"}  
                    // onClick={() => {
                    //     setTab('projects')
                    //     setNewMilestoneIsOpen(true)
                    // }}
                    size={isCollapsed ? "icon" : "default"}
                >
                    <LayoutTemplate />
                    {!isCollapsed && <p>{`Templates`}</p>}
                </Button> */}

                <ProjectBulkImportDialog isCollapsed={isCollapsed}/>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            variant={"ghost"}  
                            onClick={() => {
                                setTab('projects')
                                setNewMilestoneIsOpen(true)
                            }}
                            size={isCollapsed ? "icon" : "default"}
                            className="onborda-select-a-template"
                        >
                            <LayoutTemplate />
                            {!isCollapsed && <p>{`Templates`}</p>}
                        </Button>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent className="max-w-80">
                            <p>{`Templates`}</p>
                        </TooltipContent>
                    )}
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            onClick={async () => {
                                console.log("Add an empty project triggered")
                                const newNodes = await addMilestones([{
                                        nodeType: "PROJECT",
                                        title: 'New Project',
                                }], "Create Empty Button")

                                if (newNodes) setSelectedNodeIds(newNodes.map(node => node.id))
                            }} 
                            variant={"cta"}
                            size={isCollapsed ? "icon" : "default"}
                            className="onborda-create-a-project"
                        >
                            <Plus />
                            {/* If the header is < size MD, collapse the button to just the icon (hide text) */}
                            {!isCollapsed && <p>{`Add an empty project`}</p>}
                        </Button>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent className="max-w-80">
                            <p>{`Add an empty project`}</p>
                        </TooltipContent>
                    )}
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <div>
                            <Button
                                variant={"ghost"} 
                                disabled={milestones.filter(milestone => !milestone.private).length <= 0}
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleShare()
                                }}
                                size={isCollapsed ? "icon" : "default"}
                            >
                                <Share />
                                {!isCollapsed && <p>{`Share`}</p>}
                            </Button>
                        </div>
                    </TooltipTrigger>
                    {milestones.filter(milestone => !milestone.private).length <= 0 
                        ? (
                            <TooltipContent className="max-w-[280px]">
                                {`All projects in this plan are private and cannot be shared. Make at least one project public to enable sharing.`}
                            </TooltipContent>
                        )
                        : (
                            <TooltipContent>{`Share`}</TooltipContent>
                        )}
                </Tooltip>
            </span>

            <Dialog open={editResearchPlanIsOpen} onOpenChange={setEditResearchPlanIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Edit Research Plan Details
                        </DialogTitle>
                        <DialogDescription>
                            {`Edit details like the name and description of your Research Plan. Click save when you're done.`}
                        </DialogDescription>
                    </DialogHeader>
                    <EditResearchPlanForm researchPlanData={researchPlanDetails} closeDialog={() => setEditResearchPlanIsOpen(false)}/>
                </DialogContent>
            </Dialog>

            <Dialog open={shareIsOpen} onOpenChange={setShareIsOpen}>
                <DialogContent className="min-w-fit">
                    {typeof orgSubdomain === "string" ? (
                        <ShareDialog
                            url={`${process.env.NEXT_PUBLIC_VERCEL_ENV
                                ? `https://${orgSubdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                                : `http://${orgSubdomain}.localhost:3000`
                            }/research-plan/${researchPlanId}`}
                            organization={{
                                id: session?.user.organizationId || undefined,
                                subdomain: orgSubdomain
                            }}
                            // postMessage={`A new project ${milestone.title} has been added to ${organization.name} ${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${milestone.roadmapId}?project=${milestone.id}`}
                            // postSubject={`A new project ${milestone.title} has been added to ${organization.name}`}
                            // embeddedResearchPlanLink={`${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/embed/${organization.subdomain}/research-plan/${researchPlanId}`}
                            embeddedResearchPlanData={{
                                embeddedResearchPlanLink: `${process.env.NEXT_PUBLIC_VERCEL_ENV
                                    ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                                    : `http://localhost:3000`
                                }/embed/${orgSubdomain}/research-plan/${researchPlanId}`,
                                resarchPlanId: researchPlanId,
                                researchPlanTitle: researchPlanDetails.title || ''
                            }}
                            // trackShareEvent={(socialOption: string) => {
                            //     mixpanelTrack(`Research Plan Shared`, {
                            //         "Platform": socialOption,
                            //         ...(organization ? {
                            //             "Organization ID": organization.id,
                            //             "Organization Name": organization.name,
                            //             "Research Plan ID": researchPlanId,
                            //             "Research Plan Title": researchPlanDetails.title
                            //         } : undefined)
                            //     })
                            // }}
                            trackShareEvent={{
                                title: `Research Plan Shared`,
                                additonalProperties: {
                                    "Research Plan ID": researchPlanId,
                                    "Research Plan Title": researchPlanDetails.title || ''
                                }
                            }}
                        />
                    ) : (
                        <div className="text-sm text-muted-foreground">Loading organization...</div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
        <Separator className="w-full" />
        </>
    )
}
