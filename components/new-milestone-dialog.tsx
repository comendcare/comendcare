import { useEffect, useState } from "react"
import { MilestoneTemplates } from "./roadmap-templates"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { FaPlus } from "react-icons/fa6"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { useStoreApi } from "@xyflow/react"
import { nanoid } from "nanoid"
import { getMilestoneTypes } from "@/lib/fetchers"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { NODE_TYPE_OPTIONS } from "@/lib/types"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { FaInfoCircle } from "react-icons/fa"

const selector = (state: RoadmapState) => ({
    initialized: state.initialized,
    selectedView: state.selectedView,
    setSelectedView: state.setSelectedView,
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    nodes: state.nodes,
    milestones: state.milestones,
    saveState: state.saveState,
    addNodes: state.addNodes
})

export const NewMilestoneDialogForm = ({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) => {
    const { 
        initialized,
        selectedView,
        setSelectedView,
        selectedNodeId, 
        setSelectedNodeId, 
        nodes: dbNodes,
        milestones, 
        saveState,
        addNodes
    } = useRoadmapStore(useShallow(selector))
    const store = useStoreApi()
    const [selectedMilestoneTemplate, setSelectedMilestoneTemplate] = useState<string | undefined>()
    const [selectedMilestoneType, setSelectedMilestoneType] = useState<string>("ASSET")
    const [milestoneTypes, setMilestoneTypes] = useState<any[]>([])

    // Allow update once form is initialized
    useEffect(() => {
        const init = async () => {    
            // get milestone types from database
            const response = await getMilestoneTypes()
            if (response.success && response.data) {
                // setMilestoneTypes(response.data.map(type => ({
                //     value: type.id,
                //     label: type.label,
                //     description: type.description || undefined
                // })))
                setMilestoneTypes(response.data || [])
            }
        }

        init()
    }, []);

    // Add a empty milestone node
    // if a position is provided, place at the given coordinates
    // if a position is not provided, place in the center
    const addMilestones = async (newMilestones: any[], type: string) => {
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
        // let centerX =
        //     -transformX * zoomMultiplier + (width * zoomMultiplier) / 2
        let centerX = milestonesAlongXAxis.length > 0 ? (
            (milestonesAlongXAxis[milestonesAlongXAxis.length - 1]?.position?.x || 0) + 500
        ): (
            0
        )
        // let centerY =
        //     -transformY * zoomMultiplier + (height * zoomMultiplier) / 2
        let centerY = 0

        newMilestones.forEach(defaultData => {
            const id = nanoid()
            const milestoneId = nanoid()
            const newNode: any = {
                id: id,
                type: type,
                position: {
                    x: centerX,
                    y: centerY
                },
                origin: [0.0, 0.0],
                data: {
                    id: milestoneId,
                    nodeId: id,
                    types: defaultData?.types?.map((type: any) => {
                        const dbType = milestoneTypes.find(t => t.id === type)
                        if (dbType) {
                            return ({
                                milestoneId: milestoneId,
                                milestoneTypeId: type,
                                milestoneType: dbType
                            })
                        }
                    }).filter((type: any) => type !== undefined),
                    title: defaultData?.title || `New Milestone`,
                    ...(defaultData?.description ? { description: defaultData.description } : undefined),
                    status: defaultData?.status || "PLANNED",
                    private: true,
                    nodeType: type
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
        <Dialog open={open} onOpenChange={(open: boolean) => {
            if (!open) {
                setSelectedMilestoneTemplate(undefined)
                setSelectedMilestoneType("ASSET")
            }
            setOpen(open)
        }}>
            <DialogContent className="min-w-[80vw] h-[80vh] w-[80vw] flex flex-col justify-start gap-4">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Create a milestone
                    </DialogTitle>
                </DialogHeader>

                <h2 className="text-2xl">1. Select a milestone template</h2>

                <MilestoneTemplates
                    selectedMilestoneTemplate={selectedMilestoneTemplate}
                    setSelectedMilestoneTemplate={setSelectedMilestoneTemplate}
                    createEmpty={() => {
                        // addMilestones([{name: 'New Milestone'}])
                    }}
                    inDialog={true}
                />

                <h2 className="text-2xl">2. Select a category for your milestone</h2>

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
                                    <FaInfoCircle/>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-80 text-wrap text-left">
                                    {description}
                                </TooltipContent>
                            </Tooltip>
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>

                <DialogFooter>
                    <DialogClose>
                        <Button variant="secondary" type="button">
                            Cancel
                        </Button>
                    </DialogClose>

                    <DialogClose>
                        <Button
                            disabled={!selectedMilestoneTemplate || !selectedMilestoneType || milestoneTypes.length === 0}
                            type="button"
                            onClick={() => {
                                console.log(`add milestone`, selectedMilestoneTemplate)
                                addMilestones([selectedMilestoneTemplate], selectedMilestoneType)
                            }}
                        >
                            <FaPlus />
                            Create selected milestone
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}