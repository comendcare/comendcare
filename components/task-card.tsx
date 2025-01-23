import type {UniqueIdentifier} from "@dnd-kit/core"
import {useSortable} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {cva} from "class-variance-authority"
import {GripVertical} from "lucide-react"
import {Badge} from "@/components/ui/badge"
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
import { Milestone } from "@prisma/client"
import { ProfilePhoto } from "./profile-photo"
import { FaCheckSquare } from "react-icons/fa"
import { FaCalendar } from "react-icons/fa6"
import { truncate } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { PriorityType, StatusType } from "@/lib/types"

export interface Task {
    columnId: string;
    id: string
    status: StatusType
    name: string
    description?: string
    checklist?: any[],
    orderPosition: number,
    kanbanPosition: number,
    stakeholders?: any[],
    endDate: Date,
    priority: PriorityType
    milestone: Milestone
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

    const [description, setDescription] = useState(null)

    useEffect(() => {
      if (task?.description) {
        try {
            const newDescription = JSON.parse(task?.description || "[]")
            setDescription(newDescription) // Parse and update state when description changes
        } catch (e) {
            console.error(`could not parse description`, e)
        }
      }
    }, [task]) // Dependency on task.description to trigger re-render

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card
                    ref={setNodeRef} // necessary for drag and drop to work
                    style={style}
                    className={variants({
                        dragging: isOverlay
                            ? "overlay"
                            : isDragging
                                ? "over"
                                : undefined
                    })}
                >
                    <CardHeader className="px-3 items-center py-3 space-between flex flex-row border-b-2 border-secondary relative">
                        <Button
                            variant={"ghost"}
                            {...attributes}
                            {...listeners}
                            className="p-1 mt-1 -ml-2 h-auto cursor-grab"
                        >
                            <span className="sr-only">Move task</span>
                            <GripVertical/>
                        </Button>
                        <CardTitle className="text-lg">{task?.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-7 py-4 text-left whitespace-pre-wrap flex flex-col gap-4">
                        <div className="flex gap-4 flex-wrap">
                            <TooltipProvider>
                                {task?.priority && <PriorityBadge value={task.priority}/>}
                                {task?.milestone && (
                                    <Badge className="w-fit h-8 rounded-sm truncate bg-[#3B3C40]">
                                        {truncate(task.milestone.title, 25)}
                                    </Badge>
                                )}

                                <Tooltip>
                                    <TooltipTrigger asChild>

                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-64">
                                        <p>{`Sensitive information includes any information that should be protected. For example, don't include passwords, credit card information, or personal details.`}</p>
                                    </TooltipContent>
                                </Tooltip>
                                {task?.endDate && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                        <span className="flex gap-2 items-center text-muted-foreground">
                                            <FaCalendar className="mb-1"/>
                                            <p className="text-md">{task.endDate.toDateString().split(" ").slice(1).join(" ")}</p>
                                        </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-64">
                                            <p>{`Target date`}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                {task?.checklist && task.checklist.length > 0 && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                        <span className="flex gap-2 items-center text-muted-foreground">
                                            <FaCheckSquare />
                                            <p className="text-md">{`${task.checklist.filter(item => item.complete).length}/${task.checklist.length}`}</p>
                                        </span>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-64">
                                            <p>{`Checklist items`}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </TooltipProvider>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end mr-2">
                        {task?.stakeholders && task?.stakeholders.length > 0 && (
                            task.stakeholders.map((stakeholder, index) => (
                                <ProfilePhoto 
                                    className="ring-0 h-8 w-8 -mr-2" 
                                    key={index} 
                                    img={stakeholder.user?.image} 
                                    name={stakeholder.user?.name} 
                                />
                            ))
                        )}
                    </CardFooter>
                </Card>
            </DialogTrigger>
            <DialogContent className="min-w-fit min-h-fit">
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

const PriorityBadge = ({value}: {value: PriorityType}) => {
    const options = {
        'HIGH': {
            text: 'High',
            style: 'bg-red-600 w-fit h-8 rounded-sm'
        },
        'MEDIUM': {
            text: 'Medium',
            style: 'bg-yellow-600 w-fit h-8 rounded-sm'
        },
        'LOW': {
            text: 'Low',
            style: 'bg-green-600 w-fit h-8 rounded-sm'
        }
    }

    return (
        <Badge className={options[value].style || ''}>
            {options[value].text || 'priority'}
        </Badge>
    )
}
