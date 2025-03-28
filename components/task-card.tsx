import {useSortable} from "@dnd-kit/sortable"
import {CSS} from "@dnd-kit/utilities"
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {cva} from "class-variance-authority"
import {Calendar, CornerLeftUp, GripVertical, SquareCheck} from "lucide-react"
import {Badge} from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import {EditTaskForm} from "./edit-task-form"
import {useEffect, useState} from "react"
import { Milestone } from "@prisma/client"
import { ProfilePhoto } from "./profile-photo"
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
    isOverlay?: boolean,
    mountKey: number
}

export type TaskType = "Task"

export interface TaskDragData {
    type: TaskType
    task: Task
}

export function TaskCard({task, isOverlay, mountKey}: TaskCardProps) {
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
    const [isOpen, setIsOpen] = useState(false)
    const [selectIsOpen, setSelectIsOpen] = useState(false)

    const style = {
        transition,
        transform: CSS.Translate.toString(transform)
    }

    const variants = cva(
        "hover:cursor-pointer hover:bg-slate-100", 
        {
            variants: {
                dragging: {
                    over: "ring-2 opacity-30",
                    overlay: "ring-2 ring-primary"
                }
            }
        }
    )

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
        <>
        {isOpen && <div className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />}
        <Dialog modal={false} open={isOpen} onOpenChange={(isOpen) => {
                if (selectIsOpen && !isOpen) return
                setIsOpen(isOpen)
            }}>
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
                        <div className="flex flex-col gap-2">
                            {task?.milestone && (
                                <a 
                                    onClick={(e) => {e.stopPropagation()}}
                                    
                                    href={`/app/research-plan?milestone=${task?.milestone.nodeId}`} 
                                    className="text-sm pointer-events-auto flex gap-1 items-center text-primary/70 hover:text-primary"
                                >
                                    <CornerLeftUp size={14}/>
                                    <p className="underline">{truncate(task.milestone.title, 25)}</p>
                                </a>
                            )}
                            <CardTitle className="text-lg">{task?.name}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-7 py-4 text-left whitespace-pre-wrap flex flex-col gap-4">
                        <div className="flex gap-2 flex-wrap">
                            <TooltipProvider>
                                {task?.priority && <PriorityBadge value={task.priority}/>}
                                {/* {task?.milestone && (
                                    // bg-[#3B3C40] 
                                    <Badge variant={"secondary"} className="w-fit h-8 rounded-sm truncate text-sm h-7 w-min rounded-md px-2 py-1 font-medium">
                                        {truncate(task.milestone.title, 25)}
                                    </Badge>
                                )} */}

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
                                        <span className="flex gap-2 items-center">
                                            <Calendar className="mb-1"/>
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
                                        <span className="flex gap-2 items-center">
                                            <SquareCheck />
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
            <DialogContent className="min-w-[50vw]">
                    <DialogHeader>
                        <DialogTitle>Edit Task Details</DialogTitle>
                    </DialogHeader>
                    <EditTaskForm
                        key={mountKey}
                        taskData={task} 
                        onClose={() => {}}
                        setSelectIsOpen={setSelectIsOpen}
                    />
            </DialogContent>
        </Dialog>
        </>
    )
}

const PriorityBadge = ({value}: {value: PriorityType}) => {
    const options = {
        // 'HIGH': {
        //     text: 'High',
        //     style: 'bg-red-600 text-sm h-7 rounded-md px-2 py-1 font-medium'
        // },
        // 'MEDIUM': {
        //     text: 'Medium',
        //     style: 'bg-yellow-600 text-sm h-7 rounded-md px-2 py-1 font-medium'
        // },
        // 'LOW': {
        //     text: 'Low',
        //     style: 'bg-green-600 text-sm h-7 rounded-md px-2 py-1 font-medium'
        // }
        HIGH: {
            text: "High",
            styling: "bg-red-100 text-red-800 hover-red-400 disabled:opacity-100 hover:bg-red-200 text-sm h-7 w-min rounded-md px-2 py-1 font-medium"
        },
        MEDIUM: {
            text: "Medium",
            styling: "bg-yellow-100 text-yellow-800 disabled:opacity-100 hover:bg-yellow-200 text-sm h-7 w-min rounded-md px-2 py-1 font-medium"
        },
        LOW: {
            text: "Low",
            styling: "bg-green-100 text-green-800 disabled:opacity-100 hover:bg-green-200 text-sm h-7 w-min rounded-md px-2 py-1 font-medium"
        }
    }

    return (
        <Badge className={options[value].styling || ''}>
            {options[value].text || 'priority'}
        </Badge>
    )
}
