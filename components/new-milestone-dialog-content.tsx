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
import { DialogClose } from "@radix-ui/react-dialog"

export function NewMilestoneDialogContent({
    addMilestone
}: {
    addMilestone: () => void
}) {
    const handleAddMilestone = () => {
        addMilestone()
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Select from a milestone template?
                </DialogTitle>
                <DialogDescription>
                    {`Templates can help you get started faster, and find inspiration`}
                </DialogDescription>
                <DialogFooter>
                    <DialogClose>
                        <Button type="button">
                            Cancel
                        </Button>
                    </DialogClose>
                    <DialogClose>
                        <Button
                            type="button"
                            onClick={handleAddMilestone}
                        >
                            Create empty Milestone
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogHeader>
        </DialogContent>
    )
}