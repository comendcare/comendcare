"use client"
import React from "react"
import { Button } from "./ui/button"
import { useShallow } from "zustand/react/shallow"
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
import { DialogClose } from "@radix-ui/react-dialog"
import { KanbanState, useKanbanStore } from "@/state/kanban/kanbanStore"

const selector = (state: KanbanState) => ({
    deleteTask: state.deleteTask
})

export function DeleteTaskDialogContent({
    taskData,
}: {
    taskData: any
}) {
    const { deleteTask } = useKanbanStore(useShallow(selector))

    const handleDeleteTask = (e: React.MouseEvent<HTMLElement>) => {
        console.log(`Handle Task Delete...`)
        deleteTask(taskData?.id)
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