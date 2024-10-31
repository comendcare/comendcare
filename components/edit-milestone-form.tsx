"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
    FormDescription
} from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import StatusButton from "./milestone-status-button"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import type { TaskType } from "./milestone-node"
import type { StatusType } from "./milestone-status-button"
import { FaDollarSign, FaTrash } from "react-icons/fa6"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select"
import {
    Dialog,
    DialogTrigger
} from "./ui/dialog"
import { DeleteMilestoneDialogContent } from "./delete-milestone-dialog-content"
import { nanoid } from "nanoid"
import { toast } from "sonner"
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    useSensor,
    useSensors,
    KeyboardSensor,
    Announcements,
    UniqueIdentifier,
    TouchSensor,
    MouseSensor,
    closestCorners
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { coordinateGetter } from "@/lib/multiple-containers-keyboard-preset"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { GripVertical } from "lucide-react"
import { cva } from "class-variance-authority"

const statusTypeSchema: z.ZodType<StatusType> = z.enum(['TODO', 'INPROGRESS', 'DONE'])

const editMilestoneForm = z.object({
    title: z
        .string({
            required_error: "Please provide a title."
        })
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    timelineMonth: z.string().optional(),
    timelineYear: z.string().optional(),
    budget: z.number().optional(),
    papers: z.array(z.string()).optional(),
    tasks: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            status: statusTypeSchema,
        })
    ).optional(),
    status: z.string()
})

const monthsList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

const today = new Date()

const getYearsList = () => {
    const currentYear = today.getFullYear()
    let years = []

    for (let i = currentYear - 100; i <= currentYear + 100; i++) {
        years.push(i.toString())
    }

    return years
}

const selector = (state: RoadmapState) => ({
    setMilestone: state.setMilestone
})

export function EditMilestoneForm({
    milestoneData,
    onClose
}: {
    milestoneData: any
    onClose: () => void
}) {
    const { setMilestone } = useRoadmapStore(
        useShallow(selector)
    )

    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            title: milestoneData?.title || "",
            description: milestoneData?.description || "",
            timelineMonth: milestoneData?.timelineMonth || undefined,
            timelineYear: milestoneData?.timelineYear || undefined,
            budget: milestoneData?.budget || undefined,
            papers: milestoneData?.papers || undefined,
            tasks: milestoneData?.tasks || [],
            status: milestoneData?.status || "TODO"
        }
    })

    const title = form.watch("title")
    const description = form.watch("description")
    const timelineMonth = form.watch("timelineMonth")
    const timelineYear = form.watch("timelineYear")
    const budget = form.watch("budget")
    const papers = form.watch("papers")
    const tasks = form.watch("tasks")
    const status = form.watch("status")

    const handleMilestoneFormSubmit = () => {
        console.log(`Handle Milstone Form Submit... `)
        console.log({
            id: milestoneData?.id || "no id set",
            nodeId: milestoneData?.nodeId || "no associated node",
            title,
            description,
            timelineMonth,
            timelineYear,
            budget,
            tasks,
            status
        })
        setMilestone(milestoneData?.nodeId, {
            title,
            ...(description !== undefined && description !== null
                ? { description }
                : undefined),
            ...(timelineMonth ? { timelineMonth } : undefined),
            ...(timelineYear ? { timelineYear } : undefined),
            ...(budget ? { budget } : undefined),
            papers,
            ...(tasks 
                ? { tasks: tasks.map((task, index) => ({
                    ...task, 
                    orderPosition: index,
                    milestoneId: milestoneData?.id
                }))}
                : undefined
            ),
            status
        })
        toast('Success!', {
            description: 'The changes to your milestone have been successfully saved.'
        })
        onClose()
    }

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    return (
        <Form {...form}>
        <ScrollArea>
            <form
                onSubmit={form.handleSubmit(handleMilestoneFormSubmit)}
                className="flex flex-col gap-8 pr-4"
            >
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem className="flex flex-col grow">
                        <FormLabel className="text-xl">{`Milestone Status:`}</FormLabel>
                        <FormControl>
                            <StatusButton
                                status={
                                    field?.value as StatusType
                                }
                                onStatusChange={status =>
                                    form.setValue("status", status)
                                }
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem className="flex flex-col grow">
                        <FormLabel className="text-xl">{`Title:`}</FormLabel>
                        <FormControl>
                            <Input
                                id="title"
                                placeholder={`Enter a title`}
                                defaultValue={field.value}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem className="flex flex-col grow">
                        <FormLabel className="text-xl">{`Description:`}</FormLabel>
                        <FormControl>
                            <Textarea
                                id="description"
                                placeholder={`Enter a description`}
                                defaultValue={field.value}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <span className="flex flex-col gap-2">
                    <FormLabel className="text-xl">{`Timeline:`}</FormLabel>
                    <FormDescription>{`Enter this milestone's completion timeline (past or future)`}</FormDescription>
                    <span className="flex flex-col md:flex-row gap-4">
                        <FormField
                        control={form.control}
                        name="timelineMonth"
                        render={({ field }) => (
                            <FormItem className="grow">
                                <FormLabel>{`Month:`}</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a month" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {monthsList.map(
                                            (
                                                month: string,
                                                index: number
                                            ) => (
                                                <SelectItem
                                                    value={month}
                                                    key={index}
                                                >
                                                    {month}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="timelineYear"
                        render={({ field }) => (
                            <FormItem className="grow">
                                <FormLabel>{`Year:`}</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a year" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {getYearsList().map(
                                            (
                                                year: string,
                                                index: number
                                            ) => (
                                                <SelectItem
                                                    value={year}
                                                    key={index}
                                                >
                                                    {year}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    </span>
                </span>

                <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                    <FormItem className="flex flex-col grow">
                        <FormLabel className="text-xl">{`Budget:`}</FormLabel>
                        <FormControl>
                            <span className="flex flex-row gap-2 items-center">
                                <FaDollarSign size={24} />
                                <Input
                                    id="budget"
                                    type="number"
                                    placeholder={`Enter a number`}
                                    defaultValue={field.value}
                                    onChange={e =>
                                        field.onChange(
                                            Number(e.target.value)
                                        )
                                    }
                                />
                            </span>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="papers"
                render={({ field }) => (
                    <FormItem className="flex flex-col grow">
                        <FormLabel className="text-xl">{`Associated Papers:`}</FormLabel>
                        <FormDescription>{`Include links to any papers associated with this milestone`}</FormDescription>
                        <FormControl>
                            <>
                                <ul className="flex flex-col gap-2">
                                    {field?.value?.map(
                                        (link, index) => (
                                            <PaperField
                                                key={index}
                                                index={index}
                                                value={link}
                                                onDelete={() =>
                                                    form.setValue(
                                                        "papers",
                                                        field?.value?.filter(
                                                            (t, i) =>
                                                                i !==
                                                                index
                                                        )
                                                    )
                                                }
                                                onValueChange={newValue => {
                                                    form.setValue(
                                                        "papers",
                                                        field?.value?.map(
                                                            (
                                                                currentValue,
                                                                i
                                                            ) =>
                                                                i ===
                                                                index
                                                                    ? newValue
                                                                    : currentValue
                                                        )
                                                    )
                                                }}
                                            />
                                        )
                                    )}
                                </ul>
                                <Button
                                    onClick={(e: any) => {
                                        e.preventDefault()
                                        form.setValue("papers", [
                                            ...(field?.value || []),
                                            ""
                                        ])
                                    }}
                                >{`Add an Associated Paper`}</Button>
                            </>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="tasks"
                render={({ field }) => (
                    <FormItem className="flex flex-col grow">
                        <FormLabel className="text-xl">{`Tasks:`}</FormLabel>
                        <FormControl>
                            <>
                            <DndContext collisionDetection={closestCorners} sensors={sensors} onDragEnd={(event) => {
                                const { active, over } = event

                                if (active.id === over?.id) return

                                const originalPosition = field?.value?.findIndex(item => item.id === active.id) || 0
                                const newPosition = field?.value?.findIndex(item => item.id === over?.id) || 0

                                form.setValue('tasks', arrayMove(field?.value || [], originalPosition, newPosition))
                            }}>
                            <ol className="flex flex-col gap-2">
                                <SortableContext items={field?.value?.map(item => item.id) || []} strategy={verticalListSortingStrategy}>
                                {field?.value?.map((task, index) => ( 
                                    <TaskField
                                        key={task.id} 
                                        index={index} 
                                        task={task} 
                                        onDelete={() => (
                                            form.setValue('tasks', field?.value?.filter((t, i) => i !== index))
                                        )}
                                        onNameChange={(newName) => {
                                            form.setValue('tasks', field?.value?.map((t, i) => i === index ? {...t, name: newName} : t))
                                        }}
                                        onStatusChange={(status) => {
                                            form.setValue('tasks', field?.value?.map((t, i) => i === index ? {...t, status} : t))
                                        }}
                                    />
                                ))}
                                </SortableContext>
                            </ol>
                            </DndContext>
                            <Button onClick={(e: any) => {
                                e.preventDefault()
                                form.setValue(
                                    'tasks',
                                    [...field?.value || [], { name: 'New Task', status: 'TODO', id: nanoid() }]
                                )
                            }}>Add a task</Button>
                            </>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <span className="flex justify-end gap-4 flex-wrap">
                    <Dialog>
                        <DialogTrigger>
                            <Button type="button" variant={"destructive"}>
                                Delete Milestone
                            </Button>
                        </DialogTrigger>
                        <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
                    </Dialog>
                    <Button type="submit">Save Changes</Button>
                </span>
            </form>
        </ScrollArea>
        </Form>
    )
}

const PaperField = ({
    index,
    value,
    onDelete,
    onValueChange
}: {
    index: number
    value: string
    onDelete: () => void
    onValueChange: (newValue: string) => void
}) => {
    const deleteElement = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        onDelete()
    }

    const valueChanged = (e: React.FormEvent<HTMLInputElement>) => {
        onValueChange(e.currentTarget.value)
    }

    return (
        <li key={index} className="flex flex-row gap-2 items-center">
            <Input
                placeholder={`Enter a link to the associated paper`}
                value={value}
                onChange={valueChanged}
            />
            <Button size="icon" onClick={deleteElement}>
                <FaTrash />
            </Button>
        </li>
    )
}

const TaskField = ({
    index,
    task,
    onDelete,
    onNameChange,
    // onCompleteChange
    onStatusChange
}: {
    index: number
    task: TaskType
    onDelete: () => void
    onNameChange: (newName: string) => void
    // onCompleteChange: (complete: boolean) => void
    onStatusChange: (status: StatusType) => void
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id || "" })

    const style = {
        transition,
        transform: CSS.Translate.toString(transform)
    }

    const deleteTask = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        onDelete()
    }

    const nameChanged = (e: React.FormEvent<HTMLInputElement>) => {
        onNameChange(e.currentTarget.value)
    }

    const variants = cva("flex flex-row gap-2 items-center", {
        variants: {
            dragging: {
                overlay: "ring-2 ring-primary"
            }
        }
    })

    return (
        <li 
            key={index} 
            ref={setNodeRef} 
            style={style}
            className={variants({
                dragging: isDragging ? "overlay" : undefined
            })}
        >
            <Button
                type="button"
                variant={"ghost"}
                {...attributes}
                {...listeners}
                className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab"
            >
                <span className="sr-only">Move task</span>
                <GripVertical />
            </Button>
            <StatusButton status={task.status} onStatusChange={onStatusChange}/>
            <div className="grow">
                <Input
                    placeholder={task.name}
                    value={task.name}
                    onChange={nameChanged}
                    className="h-full"
                />
            </div>
            <Button size="icon" onClick={deleteTask}>
                <FaTrash />
            </Button>
        </li>
    )
}
