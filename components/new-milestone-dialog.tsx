import { useEffect, useRef, useState } from "react"
import { MilestoneTemplates, ResearchPlanTemplates } from "./roadmap-templates"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { getMilestoneTypes } from "@/lib/fetchers"
import { MilestoneType, MilestoneTypeOnMilestone } from "@prisma/client"
import { Info, Plus } from "lucide-react"
import { DialogDescription } from "@radix-ui/react-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ScrollArea } from "./ui/scroll-area"
import mixpanel from "mixpanel-browser"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

const selector = (state: RoadmapState) => ({
    addMilestones: state.addMilestones,
    selectedView: state.selectedView
})

export type TabType = 'projects' | 'research-plans'

export const NewMilestoneDialogForm = ({open, setOpen, tab, setTab}: {open: boolean, setOpen: (open: boolean) => void, tab: TabType, setTab: (tab: TabType) => void}) => {
    const { 
        addMilestones,
        selectedView
    } = useRoadmapStore(useShallow(selector))
    const [selectedMilestonesTemplate, setSelectedMilestonesTemplate] = useState<string[]>([])
    const [milestoneTypes, setMilestoneTypes] = useState<MilestoneType[]>([])
    // const [tab, setTab] = useState<TabType>(defaultTab)
    const dialogRef = useRef<HTMLDivElement>(null);

    // Allow update once form is initialized
    useEffect(() => {
        const init = async () => {    
            // get milestone types from database
            const response = await getMilestoneTypes({
                id: true,
                label: true,
                services: true,
                categories: true,
                description: true
            })
            if (response.success && response.data) {
                setMilestoneTypes(response.data || [])
            }
        }

        init()
    }, []);

    useEffect(() => {
        setSelectedMilestonesTemplate([])
    }, [tab])

    return (
        <Dialog open={open} onOpenChange={(open: boolean) => {
            if (!open) {
                setSelectedMilestonesTemplate([])
            }
            setOpen(open)
        }}>
            <DialogContent 
                ref={dialogRef}
                className="outline-none min-w-[80vw] w-[80vw] flex flex-col justify-start gap-4" 
                onOpenAutoFocus={(e) => {
                    e.preventDefault(); // Prevent default autofocus
                    setTimeout(() => dialogRef.current?.focus(), 0); // Focus the dialog
                }}
                tabIndex={-1} // Make it focusable
            >
                    <DialogHeader>
                        {tab === 'projects' ? (
                            <>
                                <DialogTitle className="text-2xl">
                                    Project Templates
                                </DialogTitle>
                                <DialogDescription>
                                    Select the individual project templates you would like to add to your research plan.
                                </DialogDescription>
                            </>
                        ): (
                            <>
                                <DialogTitle className="text-2xl">
                                    Research Plan Templates
                                </DialogTitle>
                                <DialogDescription>
                                    Select a research plan template to add a curated set of projects to your existing resarch plan.
                                </DialogDescription>
                            </>
                        )}
                    </DialogHeader>

                    <Tabs value={tab} onValueChange={(newTab => setTab(newTab as TabType))} className="flex h-full flex-col">
                        <TabsList className="w-fit">
                            <TabsTrigger value="projects">Project Templates</TabsTrigger>
                            <TabsTrigger value="research-plans" className="flex gap-2">
                                Research Plan Templates
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="ml-auto">
                                        <Info className="h-4 w-4"/>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-80 text-wrap text-left">
                                        {"Selected Projects from the template card will be added to your current research plan."}
                                    </TooltipContent>
                                </Tooltip>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 min-h-0">
                        <TabsContent value="projects" className="h-full">
                            <ScrollArea className="h-full" type="always">
                                <MilestoneTemplates
                                    className="h-[50vh] max-h-[50vh]"
                                    selectedMilestonesTemplate={selectedMilestonesTemplate}
                                    setSelectedMilestonesTemplate={setSelectedMilestonesTemplate}
                                    createEmpty={() => {}}
                                    inDialog={true}
                                />
                            </ScrollArea>
                        </TabsContent>
                        </div>

                        <div className="flex-1 min-h-0">
                        <TabsContent value="research-plans" className="h-full">
                            <ScrollArea className="h-full" type="always">
                                <ResearchPlanTemplates 
                                    selectedMilestonesTemplate={selectedMilestonesTemplate}
                                    setSelectedMilestonesTemplate={setSelectedMilestonesTemplate}
                                    inDialog={true}
                                />
                            </ScrollArea>
                        </TabsContent>
                        </div>
                    </Tabs>

                    <DialogFooter>
                        <DialogClose>
                            <Button variant="secondary" type="button">
                                Cancel
                            </Button>
                        </DialogClose>

                        <DialogClose>
                            <Button
                                disabled={selectedMilestonesTemplate.length === 0 || milestoneTypes.length === 0}
                                type="button"
                                variant={"cta"}
                                onClick={() => {
                                    console.log(`add milestone`, selectedMilestonesTemplate)
                                    const newMilestones = selectedMilestonesTemplate.map((template: any) => {
                                        return ({
                                            nodeType: "PROJECT",
                                            title: template?.title,
                                            description: template?.description,
                                            types: template?.types.map((type: string) => {
                                                const milestoneType = milestoneTypes.find(t => t.id === type)
                                                if (!milestoneType) return // milestone type not found, don't add it to created milestone
                                                return ({ 
                                                    milestoneTypeId: type,
                                                    milestoneType
                                                })
                                            }).filter((type: Partial<MilestoneTypeOnMilestone> | undefined) => type !== undefined),
                                            status: template?.status,
                                        })
                                    })
                                    addMilestones(selectedMilestonesTemplate.map((template: any) => {
                                        return ({
                                            nodeType: "PROJECT",
                                            title: template?.title,
                                            description: template?.description,
                                            types: template?.types.map((type: string) => {
                                                const milestoneType = milestoneTypes.find(t => t.id === type)
                                                if (!milestoneType) return // milestone type not found, don't add it to created milestone
                                                return ({ 
                                                    milestoneTypeId: type,
                                                    milestoneType
                                                })
                                            }).filter((type: Partial<MilestoneTypeOnMilestone> | undefined) => type !== undefined),
                                            status: template?.status,
                                        })
                                    }), tab === "projects" ? "Project Template" : "Resarch Plan Template")
                                }}
                            >
                                <Plus />
                                {tab === 'projects' ? `Add selected projects` : `Add projects from selected template`}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}