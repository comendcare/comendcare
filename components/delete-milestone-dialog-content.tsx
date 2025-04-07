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
    deleteNode: state.deleteNode,
    saveState: state.saveState,
    setSelectedNodeId: state.setSelectedNodeId
})

export function DeleteMilestoneDialogContent({
    milestoneData,
}: {
    milestoneData: any
}) {
    const { deleteNode, saveState, setSelectedNodeId } = useRoadmapStore(useShallow(selector))
    const { undo } = useRoadmapStore.temporal.getState()

    const handleUndo = () => {
        // undo twice to open up milestone panel if it was open previously
        undo()
        undo()
        saveState()
    }

    const handleDeleteMilestone = async (e: React.MouseEvent<HTMLElement>) => {
        console.log(`handle Milestone delete...`, milestoneData?.nodeId)
        await setSelectedNodeId(null)
        await deleteNode(milestoneData?.nodeId)
        toast(
            <div className="flex flex-col gap-2 w-full">
                <span className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900">
                        {`Project Deleted`}
                    </p>
                    <Button className="self-end" onClick={handleUndo}>Undo Delete</Button>
                </span>
                <p className="text-sm text-gray-500">
                    {`Your project had been deleted successfully.`}
                </p>
            </div>,
            {position: "bottom-left", duration: 20000}
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
                            Delete Project
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogHeader>
        </DialogContent>
    )
}