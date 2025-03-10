import { useEffect, useState } from "react"
import { MilestoneTemplates } from "./roadmap-templates"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { FaPlus } from "react-icons/fa6"

export const NewMilestoneDialogForm = ({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) => {
    // const [selectedMilestones, setSelectedMilestones] = useState<any[]>([])
    const [selectedMilestoneTemplate, setSelectedMilestoneTemplate] = useState<string | undefined>()

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
                                // addMilestones([selectedMilestoneTemplate])
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