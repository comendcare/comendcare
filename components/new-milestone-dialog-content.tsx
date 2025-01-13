"use client"

import React, { useState } from "react"
import { Button } from "./ui/button"
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { templateMilestones } from "@/lib/templates";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { CheckBubble } from "./check-bubble"
import { useRouter } from "next/navigation"

export function NewMilestoneDialogContent({
    addMilestones
}: {
    addMilestones: (newMilestones: any[]) => any[]
}) {
    const router = useRouter()
    const [selectedMilestones, setSelectedMilestones] = useState<any[]>([])

    const handleAddEmptyMilestone = () => {
        addMilestones([{name: 'New Milestone'}])
    }

    return (
        <DialogContent className="min-w-fit">
            <DialogHeader>
                <DialogTitle className="text-2xl">
                    Select from a milestone template
                </DialogTitle>
                <DialogDescription>
                    {`Templates can help you find inspiration and get started faster. Click on a Milestone Template to add it to your Research Plan.`}
                </DialogDescription>
            </DialogHeader>

            <ScrollArea className="w-full max-h-96 overflow-visible">
                <ol className="w-full pr-4 flex flex-col gap-4 overflow-visible pt-2">
                    {templateMilestones.map((milestoneData, index) => (
                        <li key={index} className="w-full overflow-visible">
                            <Card className="relative text-left overflow-visible">
                                <CardHeader>
                                    <CheckBubble data={milestoneData} onCheckedChanged={
                                        (checked: boolean) => {
                                            if (checked) {
                                                setSelectedMilestones([...selectedMilestones, milestoneData])
                                            } else {
                                                setSelectedMilestones(selectedMilestones.filter(m => (
                                                    m.title !== milestoneData.title &&
                                                    m.description !== milestoneData.description
                                                )))
                                            }
                                        }
                                    }/>
                                    <CardTitle>{milestoneData.title}</CardTitle>
                                    <CardDescription>{milestoneData.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </li>
                    ))}
                </ol>
            </ScrollArea>

            <DialogFooter>
                <DialogClose>
                    <Button variant="secondary" type="button">
                        Cancel
                    </Button>
                </DialogClose>

                <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                        router.push('/app/research-plan/templates')
                    }}
                >
                    See all templates
                </Button>

                <DialogClose>
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={handleAddEmptyMilestone}
                    >
                        Create empty Milestone
                    </Button>
                </DialogClose>
                
                <DialogClose>
                    <Button
                        disabled={selectedMilestones.length === 0}
                        type="button"
                        onClick={() => {
                            console.log(`add milestones`, selectedMilestones)
                            addMilestones(selectedMilestones)
                        }}
                    >
                        Create selected Milestones
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}