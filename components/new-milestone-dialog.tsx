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
    const [selectedMilestoneTemplate, setSelectedMilestoneTemplate] = useState<string | undefined>()
    // const [selectedMilestoneType, setSelectedMilestoneType] = useState<string>("ASSET")
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
                setSelectedMilestoneTemplate(undefined)
                // setSelectedMilestoneType("ASSET")
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
                    selectedMilestoneTemplate={selectedMilestoneTemplate}
                    setSelectedMilestoneTemplate={setSelectedMilestoneTemplate}
                    createEmpty={() => {
                        // addMilestones([{name: 'New Milestone'}])
                    }}
                    inDialog={true}
                />

                {/* <h2 className="text-2xl">2. Select a category for your milestone</h2>

                <ToggleGroup
                        type="single"
                        variant="outline"
                        value={selectedMilestoneType}
                        onValueChange={(value: string) => {
                            if (value) {
                                setSelectedMilestoneType(value)
                            }
                        }}
                        className="w-full flex flex-wrap gap-2 justify-between"
                >
                    {NODE_TYPE_OPTIONS.map(({label, value, description}) => (
                        <ToggleGroupItem
                            key={value}
                            value={value}
                            className={"text-md grow flex gap-2"}
                        >
                            {label}
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-4 w-4"/>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left">
                                    {description}
                                </TooltipContent>
                            </Tooltip>
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup> */}

                <DialogFooter>
                    <DialogClose>
                        <Button variant="secondary" type="button">
                            Cancel
                        </Button>
                    </DialogClose>

                    <DialogClose>
                        <Button
                            // disabled={!selectedMilestoneTemplate || !selectedMilestoneType || milestoneTypes.length === 0}
                            disabled={!selectedMilestoneTemplate || milestoneTypes.length === 0}
                            type="button"
                            onClick={() => {
                                console.log(`add milestone`, selectedMilestoneTemplate)
                                addMilestones([selectedMilestoneTemplate].map((template: any) => {
                                    return ({
                                        // nodeType: selectedMilestoneType as NodeType,
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