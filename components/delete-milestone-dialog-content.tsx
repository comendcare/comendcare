"use client"
import React from "react"
import { Button } from "./ui/button"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { toast } from "sonner"

const selector = (state: RoadmapState) => ({
    setSelectedNodeId: state.setSelectedNodeId,
    onNodesChange: state.onNodesChange,
    setMilestone: state.setMilestone
})

export function DeleteMilestoneDialogContent({
    milestoneData,
}: {
    milestoneData: any
}) {
    const { setSelectedNodeId, onNodesChange } = useRoadmapStore(
        useShallow(selector)
    )

    const handleDeleteMilestone = (e: React.MouseEvent<HTMLElement>) => {
        console.log(`handle Milestone delete...`)
        onNodesChange([{ id: milestoneData?.nodeId, type: "remove" }])
        setSelectedNodeId(null)
        toast(
            <div className="relative p-2 flex flex-col">
                <p className="font-semibold text-gray-900">
                    {`Milestone Deleted`}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    {`Your milestone had been deleted successfully.`}
                </p>
                <Button className="self-end mt-4">Undo Delete</Button>
            </div>
        )
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Are you absolutely sure?
                </DialogTitle>
                <DialogDescription>
                    {`This action cannot be undone. This will permanently delete your milestone and it's data.`}
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
                            variant={"destructive"}
                            onClick={handleDeleteMilestone}
                        >
                            Delete Milestone
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogHeader>
        </DialogContent>
    )
}