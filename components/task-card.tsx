import type { UniqueIdentifier } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cva } from "class-variance-authority"
import { GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ColumnId } from "@/components/kanban-board"
import { StatusType } from "./milestone-status-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { EditTaskForm } from "./edit-task-form"
import { useState } from "react"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import ChecklistCompleteButton from "./checklist-complete-button"

export interface Task {
    id: string
    status: StatusType
    name: string
    description?: string
    checklist?: any[]
    // columnId: ColumnId
    // content: string
}

interface TaskCardProps {
    task: Task
    isOverlay?: boolean
}

export type TaskType = "Task"

export interface TaskDragData {
    type: TaskType
    task: Task
}

const selector = (state: RoadmapState) => ({
    setSelectedTaskId: state.setSelectedTaskId
})

export function TaskCard({ task, isOverlay }: TaskCardProps) {
    const { setSelectedTaskId } = useRoadmapStore(useShallow(selector))
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task
        } satisfies TaskDragData,
        attributes: {
            roleDescription: "Task"
        }
    })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform)
    }

    const variants = cva("", {
        variants: {
            dragging: {
                over: "ring-2 opacity-30",
                overlay: "ring-2 ring-primary"
            }
        }
    })

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={variants({
                dragging: isOverlay
                    ? "overlay"
                    : isDragging
                    ? "over"
                    : undefined
            })}
        >
            <CardHeader className="px-3 py-3 space-between flex flex-row border-b-2 border-secondary relative">
                <Button
                    variant={"ghost"}
                    {...attributes}
                    {...listeners}
                    className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
                >
                    <span className="sr-only">Move task</span>
                    <GripVertical />
                </Button>
                <div className="flex flex-col">
                    <CardTitle className="text-lg">{task?.name}</CardTitle>
                    <CardDescription>{task?.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
                <ol id="checklist" className="flex flex-col gap-2">
                    {task?.checklist?.map(
                        (item: any, index: number) => (
                            <li key={index} className="flex gap-2 items-center">
                                <ChecklistCompleteButton complete={item.complete} onClick={() => {}}/>
                                <p>{item.name}</p>
                            </li>
                        )
                    )}
                </ol>
            </CardContent>
            <CardFooter>
                <Button onClick={() => setSelectedTaskId(task?.id)}>Edit Task</Button>
            </CardFooter>
        </Card>
    )
}
