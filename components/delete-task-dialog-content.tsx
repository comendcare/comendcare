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

// const selector = (state: RoadmapState) => ({
//     deleteNode: state.deleteNode,
//     saveState: state.saveState
// })

export function DeleteTaskDialogContent({
    taskData,
}: {
    taskData: any
}) {
    // const { deleteNode, saveState } = useRoadmapStore(useShallow(selector))
    // const { undo } = useRoadmapStore.temporal.getState()

    const handleUndo = () => {
        // undo()
        // saveState()
    }

    const handleDeleteTask = (e: React.MouseEvent<HTMLElement>) => {
        console.log(`Handle Task Delete...`)
        // deleteNode(milestoneData?.nodeId)
        toast(
            <div className="relative p-2 flex flex-col w-full">
                <p className="font-semibold text-gray-900">
                    {`Task Deleted`}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    {`Your task had been deleted successfully.`}
                </p>
                <Button className="self-end mt-4" onClick={handleUndo}>Undo Delete</Button>
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
                    {`This action cannot be undone. This will permanently delete your task and it's data.`}
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
                            onClick={handleDeleteTask}
                        >
                            Delete Task
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogHeader>
        </DialogContent>
    )
}