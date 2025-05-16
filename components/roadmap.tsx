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
import { cn, parseCSV } from "@/lib/utils"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { ArrowLeft, Ellipsis, ExternalLink, Import, Info, Pencil, Plus, Redo2, Share, Undo2, Wand2, Workflow } from "lucide-react"
import { FileUploadForm } from "./file-upload-form"
import { toast } from "sonner"
import Image from "next/image"
import { NewMilestoneDialogForm, TabType } from "./new-milestone-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Milestone } from "@/lib/types"
import Loading from "@/app/loading"
import { MilestoneType, Organization, Roadmap as RoadmapType } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useOnborda } from "./onborda/OnbordaContext"
import { ResearchPlanOnbordaState, useOnbordaStore } from "@/state/onborda/onbordaStore"
import { EditResearchPlanForm } from "./edit-research-plan-form"
import { StageOfActivityBadge } from "./public-roadmap-card"
import { Separator } from "./ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import ShareDialog from "./share-dialog"

const selector = (state: RoadmapState) => ({
    roadmapId: state.roadmapId,
    details: state.details,
    initialized: state.initialized,
    selectedView: state.selectedView,
    setSelectedView: state.setSelectedView,
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    saveState: state.saveState,
    addMilestones: state.addMilestones
})

const onbordaSelector = (state: ResearchPlanOnbordaState) => ({
    step: state.step
})

export function Roadmap() {
    // Zustand state management
    const { defaultLayout } = useSidebarStore()
    const { 
        roadmapId,
        details,
        initialized,
        selectedView,
        setSelectedView,
        selectedNodeId, 
        setSelectedNodeId, 
        milestones, 
        saveState,
        addMilestones
    } = useRoadmapStore(useShallow(selector))
    const { step } = useOnbordaStore(useShallow(onbordaSelector))
    const {data: session} = useSession()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { undo, redo } = useRoadmapStore.temporal.getState()
    const [milestoneRemountKey, setMilestoneRemountKey] = useState(1)
    const [bulkImportIsOpen, setBulkImportIsOpen] = useState(false)
    const [newMilestoneIsOpen, setNewMilestoneIsOpen] = useState(false)
    // controllig tabs in this upper level so we can manually control which tab is selected, based on which trigger button is clicked
    const [tab, setTab] = useState<TabType>('projects')
    const [milestoneTypes, setMilestoneTypes] = useState<MilestoneType[]>([])
    const [sortBy, setSortBy] = useState('custom')
    const milestoneRemountKeyRef = useRef(milestoneRemountKey);
    const [orgSubdomain, setOrgSubdomain] = useState<string | undefined>()
    const [orgIsPublished, setOrgIsPublished] = useState<boolean>(false)
    const { currentTour, currentStep, isOnbordaVisible } = useOnborda()

    useEffect(() => {
        if (step === ".onborda-select-a-template" && isOnbordaVisible) {
            setTab('projects')
            setNewMilestoneIsOpen(true)
        }
    }, [step])

    useEffect(() => {
        const init = async () => {
            // get milestone types from database
            const response = await getMilestoneTypes()
            if (response.success && response.data) {
                setMilestoneTypes(response.data || [])
            }

            if (session?.user.organizationId) {
                let orgData = await getOrganizationFromOrganizationId(session.user.organizationId)
                if (orgData.success && orgData.data) {
                    setOrgSubdomain(orgData.data.subdomain || undefined)
                    setOrgIsPublished(orgData.data.published || false)
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
            params.set("project", selectedNodeId)
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
            // <div className="w-full h-full flex justify-center items-center">
            //     <p>Research plan is not intialized... please refresh the page</p>
            // </div>
            <Loading />
        )
    }

    return (
        <TooltipProvider delayDuration={0}>
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
                        addMilestones={addMilestones}
                        milestones={milestones}
                        milestoneTypes={milestoneTypes}
                        setBulkImportIsOpen={setBulkImportIsOpen}
                        orgSubdomain={orgSubdomain}
                    />
                    <Tabs defaultValue={selectedView ? selectedView : "timeline"} onValueChange={handleTabChange} className="flex flex-col gap-4">
                        <div className="flex flex-row items-center gap-x-1 justify-start">
                            <TabsList className="mr-auto">
                                <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                                <TabsTrigger value="flow" className="flex gap-2">
                                    Flow View
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="ml-auto">
                                            <Info className="h-4 w-4"/>
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
                                    <Select value={sortBy} onValueChange={(value: string) => setSortBy(value)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue defaultValue={'custom'} placeholder={"Sort by"}>
                                                {(() => {
                                                    switch(sortBy) {
                                                        case "start":
                                                            return "Sort by: Start Date"
                                                        case "end":
                                                            return "Sort by: End Date"
                                                        default:
                                                            return "Sort by: Custom"
                                                    }
                                                })()}
                                            </SelectValue>
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
                        </div>

                        {/* Flow View */}
                        <TabsContent
                            value="flow"
                            className="m-0 h-[calc(100vh-10rem)]"
                        >
                            {milestones.length > 0 ? (
                                <PrivateFlowView
                                    width={defaultLayout[0]}
                                />
                            ): (
                                <NoMilestonesCard setNewMilestoneIsOpen={setNewMilestoneIsOpen} setTab={setTab}/>
                            )}
                        </TabsContent>
                        
                        {/* Timeline view */}
                        <TabsContent
                            value="timeline"
                            className="mt-0 h-[calc(100vh-12rem)]"
                        >
                            {milestones.length > 0 ? (
                                <PrivateTimelineView sortBy={sortBy}/>
                            ): (
                                <NoMilestonesCard setNewMilestoneIsOpen={setNewMilestoneIsOpen} setTab={setTab}/>
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
                            className="bg-white h-full flex flex-col min-w-[400px] onborda-editing-project-details"
                        >
                            <MilestoneDetailsPanel
                                remountKey={milestoneRemountKey}
                                milestone={milestones.find(
                                    milestone =>
                                        milestone.nodeId === selectedNodeId
                                )}
                                handlePanelChange={handleMilestonePanelChange}
                                orgIsPublished={orgIsPublished}
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
                                                {key: 'type', required: false, defaultValue: undefined, isValid: (entry) => typeof entry === 'string' && milestoneTypes.find(type => type.label === entry) !== undefined}
                                            ]
                                        )
                            
                                        if (result.errors.length > 0) {
                                            toast('Warning!', {
                                                position: "bottom-left",
                                                duration: 6000,
                                                description: `Missing fields in import file: A title is required for each project. Edit the Project to add title.`
                                            })
                                            console.error("Error: imported projects are missing required fields", result.errors)
                                        }

                                        addMilestones(result.values.map(milestone => {
                                            const foundType = milestoneTypes.find(type => type.label === milestone.type)

                                            return {
                                                title: milestone.title, 
                                                description: milestone.description, 
                                                types: foundType ? [{milestoneTypeId: foundType.id, milestoneType: foundType}] : [],
                                                nodeType: "PROJECT"
                                            }
                                        }), "Import")
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
                </Dialog>

                <NewMilestoneDialogForm 
                    open={newMilestoneIsOpen}
                    setOpen={setNewMilestoneIsOpen}
                    tab={tab}
                    setTab={setTab}
                />
            </ResizablePanelGroup>
        </TooltipProvider>
    )
}

const MilestoneDetailsPanel = ({
    remountKey,
    milestone,
    orgIsPublished,
    handlePanelChange
}: {
    remountKey: number,
    milestone: Milestone | undefined
    orgIsPublished: boolean,
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
                orgIsPublished={orgIsPublished}
                onClose={handleClose}
            />
        )
    }

    return <Loading />
}

const NoMilestonesCard = ({setNewMilestoneIsOpen, setTab}: {setNewMilestoneIsOpen: (val: boolean) => void, setTab: (val: TabType) => void}) => {
    const pathname = usePathname()
    const { setSelectedNodeId } = useRoadmapStore(useShallow(selector))
    const { startOnborda } = useOnborda()

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
                variant={"secondary"}
                onClick={() => {
                    if (pathname.includes('app/research-plan')) {
                        setSelectedNodeId(null)
                        setTab('projects')
                        startOnborda('research-plan-tour')
                    }
                }}
        >
                <Wand2 aria-hidden={true} />
                Take a tour
            </Button>

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
    addMilestones, 
    milestones,
    milestoneTypes, 
    setBulkImportIsOpen,
    orgSubdomain
}: {
    researchPlanId: string,
    researchPlanDetails: Partial<RoadmapType>, 
    setTab: any, 
    setNewMilestoneIsOpen: any, 
    addMilestones: any, 
    milestones: any[]
    milestoneTypes: any, 
    setBulkImportIsOpen: any,
    orgSubdomain: string | undefined
}) => {
    const {data: session, status} = useSession()
    const parentRef = useRef<HTMLDivElement>(null)
    const [parentWidth, setParentWidth] = useState(0)
    const [isCollapsed, setIsCollapsed] = useState(parentWidth <= 1024)
    const [editResearchPlanIsOpen, setEditResearchPlanIsOpen] = useState(false)
    const [shareIsOpen, setShareIsOpen] = useState(false)
    const [organization, setOrganization] = useState<Organization | {}>({})

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
        async function fetchOrgData() {
            if (session?.user.organizationId) {
                try {
                    const response = await getOrganizationFromOrganizationId(session.user.organizationId)

                    // Map the response to the correct structure if needed
                    if (response.success && response.data) {
                        setOrganization(response.data);
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }

                } catch (error) {
                    console.error("Error fetching organizations:", error);
                    toast.error("Couldn't get organizations");
                }
            }
        }

        fetchOrgData()
    }, [session])

    useEffect(() => {
        setIsCollapsed(parentWidth <= 1024)
    }, [parentWidth])

    const handleShare = async () => {
        // override default delete behaviour with our custom dialog
        setShareIsOpen(true)
    }

    return (
        <>
        <div ref={parentRef} className="flex p-x-2 justify-between items-start">
            <span className="flex flex-row items-center gap-x-1">
                <h1 className="h-full my-auto text-2xl font-semibold text-wrap line-clamp-2">{researchPlanDetails.title || "Untitled Research Plan"}</h1>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => setEditResearchPlanIsOpen(true)} 
                            variant={"ghost"}
                            size={isCollapsed ? "icon" : "default"}
                            // className="w-16"
                        >
                            <Pencil />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80">
                        <p>{`Edit the details of your research plan, like the title and description.`}</p>
                    </TooltipContent>
                </Tooltip>
                <StageOfActivityBadge milestones={milestones} />
            </span>

            <span className="onborda-create-a-project flex flex-row items-center gap-x-1 justify-end">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            disabled={milestoneTypes.length === 0}
                            onClick={() => {
                                console.log("Add an empty project triggered")
                                addMilestones([{
                                        nodeType: "PROJECT",
                                        title: 'New Project',
                                }], "Create Empty Button")
                            }} 
                            variant={"ghost"}
                            size={isCollapsed ? "icon" : "default"}
                        >
                            <Plus />
                            {/* If the header is < size MD, collapse the button to just the icon (hide text) */}
                            {!isCollapsed && <p>{`Add an empty project`}</p>}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80">
                        <p>{`Start from scratch. Add an empty project to your research plan.`}</p>
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
                            variant={"ghost"}
                            size={isCollapsed ? "icon" : "default"}
                        >
                            <Import />
                            {/* If the header is < size MD, collapse the button to just the icon (hide text) */}
                            {!isCollapsed && <p>{`Import projects`}</p>}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80">
                        <p>{`Import projects from a .csv file`}</p>
                    </TooltipContent>
                </Tooltip>

                <Button 
                    variant={"cta"}  
                    onClick={() => {
                        setTab('projects')
                        setNewMilestoneIsOpen(true)
                    }}
                >
                    Templates
                </Button>

                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                            variant="ghost"
                            className="p-2 justify-end h-full"
                        >
                            <Ellipsis/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left" sideOffset={4} className="p-1">
                            <DropdownMenuItem asChild>
                                <Link
                                    href={orgSubdomain ? `http://${orgSubdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan` : "/"}
                                    className={cn(
                                        "flex items-center"
                                    )}
                                    target={"_blank"}
                                >
                                    <ExternalLink/>
                                    View public research plan
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleShare()
                                }}
                            >
                                <Share />
                                Share
                            </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </span>

            <Dialog open={editResearchPlanIsOpen} onOpenChange={setEditResearchPlanIsOpen}>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
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
                <DialogContent>
                    { "subdomain" in organization && typeof organization.subdomain === "string" ? (
                        <ShareDialog
                            url={`${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${researchPlanId}`}
                            organization={organization}
                            // postMessage={`A new project ${milestone.title} has been added to ${organization.name} ${organization.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/${milestone.roadmapId}?project=${milestone.id}`}
                            // postSubject={`A new project ${milestone.title} has been added to ${organization.name}`}
                            embeddedProjectLink={`${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/embed/${organization.subdomain}/research-plan/${researchPlanId}`}
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