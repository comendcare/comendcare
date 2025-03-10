import { useEffect, useState } from "react"
import { MilestoneTemplates } from "./roadmap-templates"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { FaPlus } from "react-icons/fa6"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { useStoreApi } from "@xyflow/react"
import { nanoid } from "nanoid"

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
    // const [selectedMilestones, setSelectedMilestones] = useState<any[]>([])
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
                (milestonesAlongXAxis[milestonesAlongXAxis.length - 1]?.position?.x || 0) + 500
            ): (
                0
            )
            // let centerY =
            //     -transformY * zoomMultiplier + (height * zoomMultiplier) / 2
            let centerY = 0
    
            newMilestones.forEach(defaultData => {
                const id = nanoid()
                const newNode: any = {
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

    useEffect(() => {
        console.log(`selected milestone template changed`, selectedMilestoneTemplate)
    }, [selectedMilestoneTemplate])

    return (
        <Dialog open={open} onOpenChange={(open: boolean) => {
            // if (!open) setSelectedMilestones([])
            if (!open) setSelectedMilestoneTemplate(undefined)
            setOpen(open)
        }}>
            <DialogContent className="min-w-[80vw] h-[80vh] w-[80vw] flex flex-col justify-start gap-4">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        Create a milestone
                    </DialogTitle>
                    {/* <DialogDescription>
                        {`Templates can help you find inspiration and get started faster. Click on a Milestone Template to add it to your Research Plan.`}
                    </DialogDescription> */}
                </DialogHeader>

                <h2 className="text-2xl">1. Select a milestone template</h2>
                
                {/* <MilestoneTemplateTabs 
                    selectedMilestones={selectedMilestones}
                    setSelectedMilestones={setSelectedMilestones}
                    createEmpty={() => addMilestones([{name: 'New Milestone'}])}
                    inDialog={true}
                /> */}

                <MilestoneTemplates
                    // selectedMilestones={selectedMilestones}
                    // setSelectedMilestones={setSelectedMilestones}
                    selectedMilestoneTemplate={selectedMilestoneTemplate}
                    setSelectedMilestoneTemplate={setSelectedMilestoneTemplate}
                    createEmpty={() => {
                        // addMilestones([{name: 'New Milestone'}])
                    }}
                    inDialog={true}
                />

                <h2 className="text-2xl">2. What are you creating</h2>

                {/* <FormField
                    control={editOrgForm.control}
                    name="incorporationStatus"
                    render={({field}) => (
                        <FormItem className="space-y-3">
                            <FormLabel>{`What is your 501c3 status`}</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="YES"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {`Yes, I have a 501c3`}
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="INPROGRESS"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {`No, but I'm working on it`}
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="NO"/>
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            {`No, I don't have a 501c3`}
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />  */}

                <DialogFooter>
                    <DialogClose>
                        <Button variant="secondary" type="button">
                            Cancel
                        </Button>
                    </DialogClose>
                    
                    {/* <DialogClose>
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
                    </DialogClose> */}

                    <DialogClose>
                        <Button
                            disabled={!selectedMilestoneTemplate}
                            type="button"
                            onClick={() => {
                                console.log(`add milestone`, selectedMilestoneTemplate)
                                addMilestones([selectedMilestoneTemplate])
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