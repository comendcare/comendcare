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
        <DialogContent className="w-[600px]">
            <DialogHeader>
                <DialogTitle>
                    Select from a milestone template?
                </DialogTitle>
                <DialogDescription>
                    {`Templates can help you find inspiration and get started faster. Click on a Milestone Template to add it to your Research Plan.`}
                </DialogDescription>
            </DialogHeader>

            <div className="h-full w-full px-8">
            <Carousel
                opts={{
                    align: "start",
                    loop: true
                }}
                className="w-[400px]"
            >
                <CarouselContent>
                    {templateMilestones.map((milestoneData, index) => (
                        <CarouselItem className="basis-1/2">
                            <DialogClose>
                            <button onClick={() => handleAddMilestone(milestoneData)}>
                                <Card className="text-left">
                                    <CardHeader>
                                        <CardTitle>{milestoneData.title}</CardTitle>
                                        <CardDescription>{milestoneData.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </button>
                            </DialogClose>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
            </div>

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