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

                <RadioGroup
                    className="flex gap-4 justify-between px-20"
                    defaultValue="ASSET"
                    onValueChange={(value) => {setSelectedMilestoneType(value)}}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ASSET" id="ASSET"/>
                        <Label htmlFor="ASSET">Asset</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PROJECT" id="PROJECT"/>
                        <Label htmlFor="PROJECT">Project</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="RFP" id="RFP"/>
                        <Label htmlFor="RFP">RFP</Label>
                    </div>
                </RadioGroup>

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