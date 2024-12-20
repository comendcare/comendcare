import type {UniqueIdentifier} from "@dnd-kit/core"
import {useSortable} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {cva} from "class-variance-authority"
import {GripVertical} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {StatusType} from "./milestone-status-button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "./ui/dialog"
import {EditTaskForm} from "./edit-task-form"
import {useEffect, useState} from "react"
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import {usePathname, useRouter, useSearchParams} from "next/navigation"
import {Checkbox} from "./ui/checkbox"
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import { DisplayPlateEditor } from "./editor/display-plate-editor"
import { ScrollArea } from "./ui/scroll-area"
import { User } from "@prisma/client"
import { ProfilePhoto } from "./profile-photo"

export interface Task {
    columnId: string;
    id: string
    status: StatusType
    name: string
    description?: string
    checklist?: any[],
    orderPosition: number,
    kanbanPosition: number,
    stakeholders: User[]
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

export function TaskCard({task, isOverlay}: TaskCardProps) {
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

    const variants = cva("hover:cursor-pointer hover:bg-slate-100", {
        variants: {
            dragging: {
                over: "ring-2 opacity-30",
                overlay: "ring-2 ring-primary"
            }
        }
    })

    const [description, setDescription] = useState(null);

    useEffect(() => {
      if (task?.description) {
        try {
            const newDescription = JSON.parse(task?.description || "[]")
            console.log(newDescription)
            setDescription(newDescription); // Parse and update state when description changes
        } catch (e) {
            console.error(`could not parse description`, e)
        }
      }
    }, [task]); // Dependency on task.description to trigger re-render

    return (
        <Dialog className="w-[1000px]">
            <DialogTrigger asChild>
                <Card
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
                            <GripVertical/>
                        </Button>
                        <div className="flex flex-col">
                            <CardTitle className="text-lg">{task?.name}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap flex flex-col gap-8">
                        {description && (
                            <ScrollArea className="max-h-[200px]">
                                <DisplayPlateEditor value={description} />
                            </ScrollArea>
                        )}
                        {task?.checklist && task.checklist.length > 0 && (
                            <div className="flex flex-col gap-2 px-4">
                                <h2 className="font-semibold">Checklist:</h2>
                                <ol id="checklist" className="flex flex-col gap-2">
                                    {task?.checklist?.map(
                                        (item: any, index: number) => (
                                            <li key={index} className="flex gap-2 items-center">
                                                <Checkbox checked={item.complete} disabled={true}/>
                                                <p>{item.name}</p>
                                            </li>
                                        )
                                    )}
                                </ol>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {task?.stakeholders && task?.stakeholders.length > 0 && (
                            task.stakeholders.map(stakeholder => (
                                <ProfilePhoto img={stakeholder.image} name={stakeholder.name}/>
                            ))
                        )}
                    </CardFooter>
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Task Details</DialogTitle>
                    <DialogDescription>
                        {`Make changes to your profile here. Click save when you're done.`}
                    </DialogDescription>
                </DialogHeader>
                <EditTaskForm
                    taskData={task}
                    onClose={() => {}}
                />
            </DialogContent>
        </Dialog>

    )
}
