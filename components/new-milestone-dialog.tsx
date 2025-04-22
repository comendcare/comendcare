import { useEffect, useRef, useState } from "react"
import { MilestoneTemplates, ResearchPlanTemplates } from "./roadmap-templates"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { getMilestoneTypes } from "@/lib/fetchers"
import { MilestoneType, MilestoneTypeOnMilestone } from "@prisma/client"
import { Plus } from "lucide-react"
import { DialogDescription } from "@radix-ui/react-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ScrollArea } from "./ui/scroll-area"

const selector = (state: RoadmapState) => ({
    addMilestones: state.addMilestones
})

export const NewMilestoneDialogForm = ({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) => {
    const { 
        addMilestones,
    } = useRoadmapStore(useShallow(selector))
    const [selectedMilestonesTemplate, setSelectedMilestonesTemplate] = useState<string[]>([])
    const [milestoneTypes, setMilestoneTypes] = useState<MilestoneType[]>([])
    const [tab, setTab] = useState('projects')
    const dialogRef = useRef<HTMLDivElement>(null);

    // Allow update once form is initialized
    useEffect(() => {
        const init = async () => {    
            // get milestone types from database
            const response = await getMilestoneTypes()
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
                        <DialogTitle className="text-2xl">
                            Create projects
                        </DialogTitle>
                        <DialogDescription>
                            Select projects you would like to add to your research plan.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={tab} onValueChange={(newTab => setTab(newTab))} className="flex h-full flex-col">
                        {/* <TabsList className="w-fit">
                            <TabsTrigger value="projects">Project Templates</TabsTrigger>
                        </TabsList> */}

                        <div className="flex-1 min-h-0">
                        <TabsContent value="projects" className="h-full">
                            <ScrollArea className="h-full" type="always">
                                <MilestoneTemplates
                                    className="h-[50vh] max-h-[50vh]"
                                    selectedMilestonesTemplate={selectedMilestonesTemplate}
                                    setSelectedMilestonesTemplate={setSelectedMilestonesTemplate}
                                    createEmpty={() => {
                                        // addMilestones([{name: 'New Milestone'}])
                                    }}
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
                                    }))
                                }}
                            >
                                <Plus />
                                {tab === 'projects' ? `Create selected projects` : `Create selected research plan`}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}