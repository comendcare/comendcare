"use client"
import React from "react"
import { Button } from "./ui/button"
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { DialogClose } from "@radix-ui/react-dialog"
import { templateMilestones } from "@/lib/templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

export function NewMilestoneDialogContent({
    addMilestone
}: {
    addMilestone: (defaultData?: any) => void
}) {

    const handleAddMilestone = (defaultData: any) => {
        addMilestone(defaultData)
    }

    const handleAddEmptyMilestone = () => {
        addMilestone()
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Select from a milestone template?
                </DialogTitle>
                <DialogDescription>
                    {`Templates can help you find inspiration and get started faster. Click on a Milestone Template to add it to your Research Plan.`}
                </DialogDescription>
            </DialogHeader>

            <ScrollArea className="w-full max-h-96">
                <ol className="w-full pr-4 flex flex-col gap-4">
                    {templateMilestones.map((milestoneData, index) => (
                        <li key={index} className="w-full">
                            <DialogClose className="w-full">
                            <button className="w-full text-left" onClick={() => handleAddMilestone(milestoneData)}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{milestoneData.title}</CardTitle>
                                        <CardDescription>{milestoneData.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </button>
                            </DialogClose>
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
                <DialogClose>
                    <Button
                        type="button"
                        onClick={handleAddEmptyMilestone}
                    >
                        Create empty Milestone
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}