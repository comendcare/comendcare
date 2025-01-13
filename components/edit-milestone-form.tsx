"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import StatusButton from "./milestone-status-button"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import type { StatusType } from "./milestone-status-button"
import { FaLinkSlash, FaX } from "react-icons/fa6"
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
import { toast } from "sonner"
import {
    DndContext,
    useSensor,
    useSensors,
    KeyboardSensor,
    Announcements,
    TouchSensor,
    MouseSensor,
    closestCorners
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { GripVertical } from "lucide-react"
import { cva } from "class-variance-authority"
import { Switch } from "./ui/switch"
import { PrivateBadge } from "./private-badge"
import { debounce } from "lodash"
import {monthsList} from "@/lib/data";
import { MILESTONE_TYPE_OPTIONS } from "@/lib/types"
import { Prisma } from "@prisma/client"
import { Separator } from "./ui/separator"
import { AssetEditForm } from "./asset-edit-form"
import { RFPEditForm } from "./rfp-edit-form"
import { PapersEditForm } from "./papers-edit-form"
import { FaEdit } from "react-icons/fa"
import { KanbanState, useKanbanStore } from "@/state/kanban/kanbanStore"

type AssetType = Prisma.AssetGetPayload<{ 
    omit: { id: true, createdAt: true, updatedAt: true }
    include: { 
        contacts: { 
            select: { name: true, role: true, email: true } 
        }, 
        attachments: {
            select: { name: true, link: true }
        }
    } 
}>
type RFPType = Prisma.RFPGetPayload<{
    omit: { id: true, createdAt: true, updatedAt: true, researchFocus: true }
    include: { 
        contacts: { 
            select: { name: true, role: true, email: true } 
        }, 
        attachments: {
            select: { name: true, link: true }
        }
    }
}>
type AttachmentType = AssetType['attachments'][0]
type TaskType = Prisma.TaskGetPayload<{}>

const statusTypeSchema: z.ZodType<StatusType> = z.enum(['TODO', 'INPROGRESS', 'DONE'])
const SHOW_ACCESSIBILITY_MESSAGES = process.env.NODE_ENV === "development"

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

const kanbanSelector = (state: KanbanState) => ({
    columns: state.columns,
    tasks: state.tasks,
    setTask: state.setTask,
    setTasks: state.setTasks
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
    const { columns: kanbanColumns, tasks: kanbanTasks, setTask, setTasks } = useKanbanStore(useShallow(kanbanSelector))
    const initializing = useRef(true)

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
        type: z.string(),
        startDate: z.object({
            month: z.string().optional(),
            year: z.string().optional(),
        }),
        endDate: z.object({
            month: z.string().optional(),
            year: z.string().optional()
        }),
        budget: z.number().optional(),
        papers: z.array(z.custom<AttachmentType>()).optional(),
        tasks: z.array(z.custom<TaskType>()).optional(),
        status: z.string(),
        private: z.boolean(),
        asset: z.custom<AssetType>().optional(),
        RFP: z.custom<RFPType>().optional()
    })

    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            title: milestoneData?.title || "",
            description: milestoneData?.description || "",
            type: milestoneData?.type || "NOTYPE",
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
            tasks: kanbanTasks?.filter((task: any) => task.milestoneId && task.milestoneId === milestoneData?.id) || [],
            status: milestoneData?.status || "TODO",
            private: milestoneData?.private || false,
            asset: milestoneData?.asset || undefined,
            RFP: milestoneData?.RFP || undefined
        }
    })

    const formData = {
        title: form.watch("title"),
        description: form.watch("description"),
        type: form.watch("type"),
        startDate: form.watch("startDate"),
        endDate: form.watch("endDate"),
        budget: form.watch("budget"),
        papers: form.watch("papers"),
        tasks: form.watch("tasks"),
        status: form.watch("status"),
        isPrivate: form.watch("private"),
        asset: form.watch("asset"),
        RFP: form.watch("RFP")
    }

    // callback ensures we're not creating a new debounce every time this is called
    const debounceUpdates = useCallback(
        debounce((updatedValues) => handleMilestoneFormSubmit(updatedValues), 500), []
    )

    // Allow update once form is initialized
    useEffect(() => {
        initializing.current = false;
    }, []);

    // Watch form changes, don't watch while initializing
    useEffect(() => {
        const subscription = form.watch((values) => debounceUpdates(values))
        return () => subscription.unsubscribe();
    }, [form.watch])

    const handleMilestoneFormSubmit = (values: z.infer<typeof editMilestoneForm>) => {
        const { title, description, type, startDate, endDate, budget, papers, tasks, status, private: isPrivate, asset, RFP } = values;
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
            ...(papers
                ? { papers }
                : undefined
            ),
            ...(type
                ? { type }
                : { type: 'NOTYPE'}
            ),
            status,
            private: isPrivate || false,
            asset,
            RFP
        })

        setTasks(kanbanTasks.map(task => {
            const newTask = tasks?.find(t => t.id === task.id)

            // link relevant tasks to this milestone
            if (newTask) {
                return {
                    ...task,
                    name: newTask.name,
                    columnId: newTask.columnId,
                    milestone: { id: milestoneData?.id },
                    milestoneId: milestoneData?.id,
                }
            }

            // unlink tasks that are no longer attached to this milestone
            if (!newTask && milestoneData?.id && task.milestoneId === milestoneData.id) {
                console.log(`unlink task`, task.name)
                return {
                    ...task,
                    milestone: undefined,
                    milestoneId: undefined
                }
            }

            return task
        }))
        
        toast('Success!', {
            position: "bottom-left",
            description: 'The changes to your milestone have been successfully saved.'
        })
    }

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    function getDraggedData(id: string) {
        const name = formData.tasks?.find(task => task.id === id)?.name
        const position = (formData.tasks?.findIndex(task => task.id === id) || 0) + 1
        const length = formData.tasks?.length || 0

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
        <ScrollArea className="research-plan-tour-step3">
            <form
                onSubmit={form.handleSubmit(handleMilestoneFormSubmit)}
                onChange={() => console.log(`CHANGE`)}
                className="flex flex-col gap-8 p-2 pr-4"
            >
                <span className="flex justify-end">
                <Button variant="secondary" onClick={onClose}>
                    <FaX />
                </Button>
                </span>

                <EditTitle form={form}/>

                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem className="flex flex-col grow">
                        <FormLabel className="text-2xl font-semibold leading-none tracking-tight">{`Description`}</FormLabel>
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

                <FormItem className="w-full grid grid-cols-[150px_auto] gap-4 items-center">
                    <FormLabel className="text-md">{`Milestone Type`}</FormLabel>
                    <FormField
                        control={form.control}
                        name="type"
                        render={({field}) => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <Select
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a milestone type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MILESTONE_TYPE_OPTIONS.map((type, index) => (
                                                <SelectItem key={index} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormLabel className="text-md">{`Private`}</FormLabel>
                    <FormField
                    control={form.control}
                    name="private"
                    render={({ field }) => (
                        <FormItem className="h-full flex flex-row grow items-center justify-end gap-4">
                            {formData.isPrivate && (
                                <PrivateBadge />
                            )}
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormLabel className="text-md">{`Milestone Status`}</FormLabel>
                    <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem className="h-full flex items-center justify-end gap-4">
                            <FormControl className="h-full">
                                <StatusButton
                                    status={
                                        field?.value as StatusType
                                    }
                                    onStatusChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </FormItem>

                <Separator />

                <span className="flex flex-col gap-2">
                    <FormLabel className="text-2xl font-semibold leading-none tracking-tight">{`Timeline`}</FormLabel>

                    <FormItem className="w-full grid grid-cols-[50px_auto_auto] gap-4 items-center">
                        <FormLabel className="text-md">{`Start`}</FormLabel>
                        <FormField 
                            control={form.control}
                            name="startDate.month"
                            render={({ field }) => (
                                <FormItem className="h-full grow">
                                <Select
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
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
                                <FormItem className="h-full grow">
                                    <Select
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
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

                        <FormLabel className="text-md">{`End`}</FormLabel>
                        <FormField 
                            control={form.control}
                            name="endDate.month"
                            render={({ field }) => (
                                <FormItem className="h-full grow">
                                <Select
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
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
                                <FormItem className="h-full grow">
                                    <Select
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
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
                        <FormMessage />
                    </FormItem>
                </span>

                <Separator />

                <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                    <FormItem>
                            <span className="w-full h-full flex flex-row items-center justify-between">
                                <FormLabel className="text-2xl font-semibold leading-none tracking-tight">{`Budget`}</FormLabel>
                                <FormControl className="grow w-full h-full">
                                    <Input
                                        className="h-full"
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
                                </FormControl>
                            </span>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <Separator />

                <FormField
                control={form.control}
                name="tasks"
                render={({ field }) => (
                    <FormItem className="flex flex-col grow">
                        <FormControl>
                            <>
                            {formData.tasks && formData.tasks.length > 0 && (
                                <>
                                <FormLabel className="text-2xl font-semibold leading-none tracking-tight">{`Tasks`}</FormLabel>
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
                                            onUnlink={() => {
                                                form.setValue('tasks', field?.value?.filter((t, i) => i !== index))
                                            }}
                                            onNameChange={(newName) => {
                                                form.setValue('tasks', field?.value?.map((t, i) => i === index ? {...t, name: newName} : t))
                                            }}
                                            onColumnChange={(newColumnId) => {
                                                form.setValue('tasks', field?.value?.map((t, i) => i === index ? {...t, columnId: newColumnId} : t))
                                            }}
                                            kanbanColumns={kanbanColumns}
                                        />
                                    ))}
                                    </SortableContext>
                                </ol>
                                </DndContext>
                                </>
                            )}
                            <LinkTask 
                                milestoneId={milestoneData?.id} 
                                kanbanTasks={kanbanTasks}
                                onLink={(taskId) => {
                                    const newTask = kanbanTasks?.find((task) => task.id === taskId)
                                    form.setValue(
                                        'tasks', 
                                        [...field?.value || [], {
                                            ...newTask,
                                            milestoneId: milestoneData?.id,
                                            milestone: { id: milestoneData?.id }
                                        }] 
                                    )
                                }}
                            />
                            </>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <Separator />

                <PapersEditForm
                    form={form}
                    papers={formData.papers as AttachmentType[]}
                />

                <Separator />

                <AssetEditForm 
                    form={form}
                    asset={formData.asset as AssetType}
                />

                <Separator />

                <RFPEditForm
                    form={form}
                    RFP={formData.RFP as RFPType} 
                />

                <span className="flex justify-end gap-4 flex-wrap">
                    <Dialog>
                        <DialogTrigger>
                            <Button type="button" variant="destructive">
                                Delete Milestone
                            </Button>
                        </DialogTrigger>
                        <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
                    </Dialog>
                    <Button type="submit" id="edit-milestone-scroll-area" className="research-plan-tour-step4">Save Changes</Button>
                </span>
            </form>
        </ScrollArea>
        </Form>
    )
}

const EditTitle = ({ form }: { form: any }) => {
    const [isEditing, setIsEditing] = useState(false)
    
    return (
        <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
            <FormItem className="flex flex-col grow">
                <FormControl>
                    {isEditing ? (
                        <span className="flex flex-row gap-2">
                        <div className="h-full w-full">
                            <Input
                                id="title"
                                className="h-full w-full"
                                placeholder={`Enter a title`}
                                defaultValue={field.value}
                                {...field}
                            />
                        </div>
                        <Button variant="ghost" className="p-2" onClick={(e) => {
                            e.preventDefault()
                            setIsEditing(false)
                        }}><FaX /></Button>
                        </span>
                    ) : (
                        <span className="flex flex-row gap-2 items-center">
                        <h1 className="text-xl font-semibold w-full h-full">{field.value}</h1>
                        <Button variant="ghost" className="p-2" onClick={(e) => {
                            e.preventDefault()
                            setIsEditing(true)
                        }}><FaEdit /></Button>
                        </span>
                    )}
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
        />
    )
}

const LinkTask = ({ milestoneId, kanbanTasks, onLink }: { milestoneId: string, kanbanTasks: any[], onLink: (id: string) => void }) => {
    const [isLinking, setIsLinking] = useState(false)

    if (isLinking) {
        return (
            <Select 
                onValueChange={(value: string) => {
                    onLink(value)
                    setIsLinking(false)
                }}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={'Select a task'}/>
                </SelectTrigger>
                <SelectContent>
                    {kanbanTasks?.filter((task: any) => task.milestoneId !== milestoneId).map(task => (
                        <SelectItem key={task.id} value={task.id}>{task.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )
    }

    return (
        <Button 
            disabled={kanbanTasks?.filter((task: any) => task.milestoneId !== milestoneId).length === 0} 
            variant={'secondary'}
            onClick={() => {setIsLinking(true)}}
        >
            {kanbanTasks?.filter((task: any) => task.milestoneId === milestoneId).length === 0 ? (
                `Link kanban task`
            ): (
                `Link another kanban task`
            )}
        </Button>
    )
}

const TaskField = ({
    index,
    task,
    onUnlink,
    onNameChange,
    onColumnChange,
    kanbanColumns,
}: {
    index: number
    task: TaskType
    onUnlink: () => void
    onNameChange: (newName: string) => void
    onColumnChange: (newColumnId: string) => void
    kanbanColumns: any[]
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

    const unlinkTask = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        onUnlink()
    }

    const nameChanged = (e: React.FormEvent<HTMLInputElement>) => {
        onNameChange(e.currentTarget.value)
    }

    const columnChanged = (newColumnId: string) => {
        onColumnChange(newColumnId)
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
            {/* move task */}
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

            {/* select kanban column */}
            <Select onValueChange={(value: string) => columnChanged(value)} value={task.columnId}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    {kanbanColumns.map(column => (
                        <SelectItem key={column.id} value={column.id}>{column.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* task name */}
            <div className="grow">
                <Input
                    placeholder={task.name}
                    value={task.name}
                    onChange={nameChanged}
                    className="h-full"
                />
            </div>

            {/* delete task */}
            <Button variant="secondary" size="icon" onClick={unlinkTask}>
                <FaLinkSlash />
            </Button>
        </li>
    )
}
