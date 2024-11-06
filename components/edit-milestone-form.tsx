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
import { CalendarIcon, GripVertical } from "lucide-react"
import { cva } from "class-variance-authority"
import { DatePicker } from "@tremor/react"
import { Popover, PopoverContent } from "./ui/popover"
import { PopoverTrigger } from "./plate-ui/popover"
import { Calendar } from "./ui/calendar"
import { format } from "date-fns"
import { cn, monthsList } from "@/lib/utils"

const statusTypeSchema: z.ZodType<StatusType> = z.enum(['TODO', 'INPROGRESS', 'DONE'])
const SHOW_ACCESSIBILITY_MESSAGES = process.env.NODE_ENV === "development"

interface TimelineDateType {
    month?: string | undefined,
    year?: string | undefined
}

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

    const validateTimeline = (): boolean => {
        console.log(`validate timeline`, startDate, endDate)
        const now = new Date()
        const startDateValue = startDate.month !== undefined || startDate.year !== undefined 
            ? (new Date(
                    startDate.year ? Number.parseInt(startDate.year) : now.getFullYear(),
                    startDate.month ? monthsList.findIndex(month => month === startDate.month) : 0,
                    1
                )).valueOf()
            : undefined
    
        const endDateValue = endDate.month !== undefined || endDate.year !== undefined 
            ? (new Date(
                    endDate.year ? Number.parseInt(endDate.year) : now.getFullYear(),
                    endDate.month ? monthsList.findIndex(month => month === endDate.month) : 0,
                    1
                )).valueOf()
            : undefined
    
        if (startDateValue !== undefined && endDateValue !== undefined) return startDateValue <= endDateValue
        return true
    }

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
        startDate: z.object({
            month: z.string().optional(),
            year: z.string().optional(),
        }),
        // startDate: z.object({
        //     month: z.string().optional(),
        //     year: z.string().optional(),
        // }).refine(validateTimeline, { 
        //     message: "Start date must occur before end date."
        // }),
        endDate: z.object({
            month: z.string().optional(),
            year: z.string().optional()
        }),
        // endDate: z.object({
        //     month: z.string().optional(),
        //     year: z.string().optional()
        // }).refine(validateTimeline, { 
        //     message: "End date must occur after start date."
        // }),
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

    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            title: milestoneData?.title || "",
            description: milestoneData?.description || "",
            startDate: {
                month: milestoneData?.startDate?.getMonth() ? monthsList[milestoneData?.startDate?.getMonth()] : undefined,
                year: milestoneData?.startDate?.getFullYear()?.toString() || undefined
            },
            endDate: {
                month: milestoneData?.endDate?.getMonth() ? monthsList[milestoneData?.endDate?.getMonth()] : undefined,
                year: milestoneData?.endDate?.getFullYear()?.toString()|| undefined
            },
            budget: milestoneData?.budget || undefined,
            papers: milestoneData?.papers || undefined,
            tasks: milestoneData?.tasks || [],
            status: milestoneData?.status || "TODO"
        }
    })

    const title = form.watch("title")
    const description = form.watch("description")
    const startDate = form.watch("startDate")
    const endDate = form.watch("endDate")
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
            startDate,
            endDate,
            budget,
            tasks,
            status
        })
        const now = new Date()
        setMilestone(milestoneData?.nodeId, {
            title,
            ...(description !== undefined && description !== null
                ? { description }
                : undefined),
            ...(startDate.month !== undefined || startDate.year !== undefined ? { startDate: new Date(
                startDate.year ? Number.parseInt(startDate.year) : now.getFullYear(),
                startDate.month ? monthsList.findIndex(month => month === startDate.month) : 0,
                1
            ) } : undefined),
            ...(endDate.month !== undefined || endDate.year !== undefined ? { endDate: new Date(
                endDate.year ? Number.parseInt(endDate.year) : now.getFullYear(),
                endDate.month ? monthsList.findIndex(month => month === endDate.month) : 0,
                1
            ) } : undefined),
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

    function getDraggedData(id: string) {
        const name = tasks?.find(task => task.id === id)?.name
        const position = (tasks?.findIndex(task => task.id === id) || 0) + 1
        const length = tasks?.length || 0

        return { name, position, length }
    }

    const announcements: Announcements = {
        onDragStart({ active }) {
            const data = getDraggedData(active?.id.toString())
            const message = `Picked up task ${data.name} at position ${data.position} of ${data.length}`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragOver({ active, over }) {
            const activeData = getDraggedData(active?.id.toString())

            if (over) {
                const overData = getDraggedData(over?.id.toString())
                const message = `Task ${activeData.name} was moved over position ${overData.position} of ${activeData.length}.`
                if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
                return message
            }
        
            const message = `Task ${activeData.name} is no longer over a droppable position.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragEnd({ active, over }) {
            const activeData = getDraggedData(active?.id.toString())

            if (over) {
                const overData = getDraggedData(over?.id.toString())
                const message = `Task ${activeData.name} was dropped into position ${overData.position} of ${activeData.length}`
                if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
                return message
            }
        
            const message = `Task ${activeData} was dropped.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragCancel({ active }) {
            const activeData = getDraggedData(active?.id.toString())
            const message = `Dragging was cancelled. Task ${activeData.name} was dropped.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
    }

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

                    <FormItem>
                        <FormLabel className="text-lg">{`Start:`}</FormLabel>
                        <span className="w-full grid grid-cols-2 gap-4">
                        <FormField 
                            control={form.control}
                            name="startDate.month"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Month:</FormLabel>
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
                                </FormItem>
                            )}
                        />

                        <FormField 
                            control={form.control}
                            name="startDate.year"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Year:</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
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
                                </FormItem>
                            )}
                        />
                        </span>
                        <FormMessage />
                    </FormItem>

                    <FormItem>
                        <FormLabel className="text-lg">{`End:`}</FormLabel>
                        <span className="w-full grid grid-cols-2 gap-4">
                        <FormField 
                            control={form.control}
                            name="endDate.month"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Month:</FormLabel>
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
                                </FormItem>
                            )}
                        />

                        <FormField 
                            control={form.control}
                            name="endDate.year"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Year:</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
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
                                </FormItem>
                            )}
                        />
                        </span>
                    </FormItem>
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
                            <DndContext 
                                accessibility={{
                                    announcements
                                }}
                                collisionDetection={closestCorners} 
                                sensors={sensors} 
                                onDragEnd={(event) => {
                                    const { active, over } = event

                                    if (active.id === over?.id) return

                                    const originalPosition = field?.value?.findIndex(item => item.id === active.id) || 0
                                    const newPosition = field?.value?.findIndex(item => item.id === over?.id) || 0

                                    form.setValue('tasks', arrayMove(field?.value || [], originalPosition, newPosition))
                                }}
                            >
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
