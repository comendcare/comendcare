import { useEffect, useRef, useState } from "react"
import { MilestoneTemplates } from "./roadmap-templates"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { useStoreApi } from "@xyflow/react"
import { getMilestoneTypes } from "@/lib/fetchers"
import { NODE_TYPE_OPTIONS, NodeType } from "@/lib/types"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { MilestoneType, MilestoneTypeOnMilestone } from "@prisma/client"
import { Info, Plus } from "lucide-react"

const selector = (state: RoadmapState) => ({
    addMilestones: state.addMilestones
})

export const NewMilestoneDialogForm = ({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) => {
    const { 
        addMilestones,
    } = useRoadmapStore(useShallow(selector))
    const store = useStoreApi()
    const [selectedMilestonesTemplate, setSelectedMilestonesTemplate] = useState<string[]>([])
    const [milestoneTypes, setMilestoneTypes] = useState<MilestoneType[]>([])
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

    return (
        <Dialog open={open} onOpenChange={(open: boolean) => {
            if (!open) {
                setSelectedMilestonesTemplate([])
            }
            setOpen(open)
        }}>
            <DialogContent 
                ref={dialogRef}
                className="outline-none min-w-[80vw] h-[80vh] w-[80vw] flex flex-col justify-start gap-4" 
                onOpenAutoFocus={(e) => {
                    e.preventDefault(); // Prevent default autofocus
                    setTimeout(() => dialogRef.current?.focus(), 0); // Focus the dialog
                }}
                tabIndex={-1} // Make it focusable
            >
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Create a project
                    </DialogTitle>
                </DialogHeader>

                {/* <h2 className="text-2xl">1. Select a milestone template</h2> */}
                <h2 className="text-2xl">Select a Project template</h2>

                <MilestoneTemplates
                    selectedMilestonesTemplate={selectedMilestonesTemplate}
                    setSelectedMilestonesTemplate={setSelectedMilestonesTemplate}
                    createEmpty={() => {
                        // addMilestones([{name: 'New Milestone'}])
                    }}
                    inDialog={true}
                />

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
                            Create selected project
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}