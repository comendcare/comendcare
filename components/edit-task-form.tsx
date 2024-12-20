"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import React, {useCallback, useEffect, useState} from "react"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
} from "./ui/form"
import {Input} from "./ui/input"
import {Textarea} from "./ui/textarea"
import {Button} from "./ui/button"
import {ScrollArea} from "./ui/scroll-area"
import type {StatusType} from "./milestone-status-button"
import {
    Dialog,
    DialogClose,
    DialogTrigger
} from "./ui/dialog"
import {DeleteTaskDialogContent} from "./delete-task-dialog-content"
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import StatusButton from "./milestone-status-button"
import {nanoid} from "nanoid"
import {FaTrash} from "react-icons/fa6"
import {Checkbox} from "./ui/checkbox"
import {toast} from "sonner"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"
import {CalendarIcon, GripVertical} from "lucide-react"
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
import {CSS} from "@dnd-kit/utilities"
import {coordinateGetter} from "@/lib/multiple-containers-keyboard-preset"
import {cva} from "class-variance-authority"
import {debounce} from "lodash"
import {SettingsProvider} from "@/components/editor/settings";
import {PlateEditor} from "@/components/editor/plate-editor";
import { KanbanState, useKanbanStore } from "@/state/kanban/kanbanStore"
import { getMembers, getMilestones, getOrganizationData } from "@/lib/fetchers"
import MultiSelect from "./multi-select"
import MultipleSelector from "./ui/multiple-selector"
import { Member, Milestone, User } from "@prisma/client"
import { useSession } from "next-auth/react"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "./ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "./ui/calendar"

const statusTypeSchema: z.ZodType<StatusType> = z.enum(['TODO', 'INPROGRESS', 'DONE'])
const SHOW_ACCESSIBILITY_MESSAGES = process.env.NODE_ENV === "development"

const optionSchema = z.object({
    label: z.string(),
    value: z.string(),
    disable: z.boolean().optional(),
})

const editTaskForm = z.object({
    name: z
        .string({
            required_error: "Please provide a name"
        })
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),
    status: statusTypeSchema,
    description: z.array(z.record(z.any())),
    checklist: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            complete: z.boolean(),
        }) 
    ).optional(),
    stakeholders: z.array(optionSchema).min(0).optional(),
    milestone: z.string().optional(),
    targetDate: z.any().optional(),
    priority: z.string().optional()
})

const selector = (state: KanbanState) => ({
    setTask: state.setTask
})

export function EditTaskForm({
    taskData,
    onClose
}: {
    taskData: any
    onClose: () => void
}) {
    const { data: session } = useSession()
    const { setTask } = useKanbanStore(useShallow(selector))
    const form = useForm<z.infer<typeof editTaskForm>>({
        mode: "onChange",
        resolver: zodResolver(editTaskForm),
        defaultValues: {
            name: taskData?.name,
            status: taskData?.status || 'TODO',
            description: JSON.parse(taskData?.description || "[]") || [],
            checklist: taskData?.checklist || undefined,
            stakeholders: taskData?.stakeholders?.map((stakeholder: User) => ({ value: stakeholder.id, label: stakeholder.name })) || [],
            milestone: taskData?.milestone?.id || undefined,
            targetDate: taskData?.endDate || undefined,
            priority: taskData?.priority || undefined
        }
    })

    const [fetchedMembers, setFetchedMembers] = useState<User[]>([])
    const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const response = await getMembers(session?.user?.organizationId || undefined)
            if (response.success) {
                setFetchedMembers(response?.data?.map(member => member.user) as User[])
            } else {
                console.error(response.error)
            }

            const milestonesResponse = await getMilestones(session?.user?.organizationId || undefined)
            if (milestonesResponse.success) {
                setFetchedMilestones(milestonesResponse?.data as Milestone[])
            } else {
                console.error(milestonesResponse.error)
            }
        }

        fetchData()
    }, [])

    const name = form.watch("name")
    const status = form.watch("status")
    const description = form.watch("description")
    const checklist = form.watch("checklist")
    const stakeholders = form.watch("stakeholders")
    const milestone = form.watch("milestone")
    const targetDate = form.watch("targetDate")
    const priority = form.watch("priority")

    const handleFormSubmit = (values: z.infer<typeof editTaskForm>) => {
        const stakeholderIds = stakeholders?.map(stakeholder => stakeholder.value)

        console.log(`targetDate`, targetDate)

        setTask(
            taskData?.id,
            {
                name,
                status,
                ...(description ? {description: JSON.stringify(description)} : undefined),
                ...(checklist
                    ? {checklist: checklist.map((item, index) => ({...item, orderPosition: index}))}
                    : undefined),
                ...(stakeholders ? { stakeholders: fetchedMembers?.filter(member => stakeholderIds?.includes(member.id)) }: undefined),
                ...(milestone ? { milestone: { id: milestone } }: undefined),
                ...(targetDate ? { endDate: targetDate } : undefined),
                ...(priority ? { priority } : undefined)
            }
        )
        toast('Success!', {
            position: "bottom-left",
            description: 'The changes to your task have been successfully saved.'
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
        const name = checklist?.find(item => item.id === id)?.name
        const position = (checklist?.findIndex(item => item.id === id) || 0) + 1
        const length = checklist?.length || 0

        return {name, position, length}
    }

    const announcements: Announcements = {
        onDragStart({active}) {
            const data = getDraggedData(active?.id.toString())
            const message = `Picked up checklist item ${data.name} at position ${data.position} of ${data.length}`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragOver({active, over}) {
            const activeData = getDraggedData(active?.id.toString())

            if (over) {
                const overData = getDraggedData(over?.id.toString())
                const message = `Checklist item ${activeData.name} was moved over position ${overData.position} of ${activeData.length}.`
                if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
                return message
            }

            const message = `Checklist item ${activeData.name} is no longer over a droppable position.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragEnd({active, over}) {
            const activeData = getDraggedData(active?.id.toString())

            if (over) {
                const overData = getDraggedData(over?.id.toString())
                const message = `Checklist item ${activeData.name} was dropped into position ${overData.position} of ${activeData.length}`
                if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
                return message
            }

            const message = `Checklist item ${activeData} was dropped.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragCancel({active}) {
            const activeData = getDraggedData(active?.id.toString())
            const message = `Dragging was cancelled. Checklist item ${activeData.name} was dropped.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
    }

    return (
        <Form {...form}>
            <ScrollArea className={"max-h-[600px]"}>
                <form
                    onSubmit={form.handleSubmit(handleFormSubmit)}
                    className="flex flex-col gap-8 p-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem className="flex flex-col grow">
                                <FormLabel className="text-xl">{`Name:`}</FormLabel>
                                <FormControl>
                                    <Input
                                        id="name"
                                        placeholder={`Enter a name`}
                                        defaultValue={field.value}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem className="flex flex-col grow">
                                <FormControl>
                                    <div className="w-full" data-registry="plate">
                                        <SettingsProvider>
                                            <PlateEditor 
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </SettingsProvider>
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="checklist"
                        render={({field}) => (
                            <FormItem className="flex flex-col grow">
                                <FormLabel className="text-xl">{`Checklist`}</FormLabel>
                                <FormControl>
                                    <>
                                        <DndContext
                                            accessibility={{
                                                announcements
                                            }}
                                            collisionDetection={closestCorners}
                                            sensors={sensors}
                                            onDragEnd={(event) => {
                                                const {active, over} = event

                                                if (active.id === over?.id) return

                                                const originalPosition = field?.value?.findIndex(item => item.id === active.id) || 0
                                                const newPosition = field?.value?.findIndex(item => item.id === over?.id) || 0

                                                form.setValue('checklist', arrayMove(field?.value || [], originalPosition, newPosition))
                                            }}
                                        >
                                            <ol className="flex flex-col gap-2">
                                                <SortableContext items={field?.value?.map(item => item.id) || []}
                                                                 strategy={verticalListSortingStrategy}>
                                                    {field?.value?.map((checklistItem, index) => (
                                                        <ChecklistField
                                                            key={checklistItem.id}
                                                            index={index}
                                                            item={checklistItem}
                                                            onDelete={() => (
                                                                form.setValue('checklist', field?.value?.filter((t, i) => i !== index))
                                                            )}
                                                            onNameChange={(name) => {
                                                                form.setValue('checklist', field?.value?.map((t, i) => i === index ? {
                                                                    ...t,
                                                                    name
                                                                } : t))
                                                            }}
                                                            onCompleteChange={(complete) => {
                                                                form.setValue('checklist', field?.value?.map((t, i) => i === index ? {
                                                                    ...t,
                                                                    complete
                                                                } : t))
                                                            }}
                                                        />
                                                    ))}
                                                </SortableContext>
                                            </ol>
                                        </DndContext>
                                        <Button variant="secondary" onClick={(e: any) => {
                                            e.preventDefault()
                                            form.setValue(
                                                'checklist',
                                                [...field?.value || [], {
                                                    name: 'New Item',
                                                    complete: false,
                                                    id: nanoid()
                                                }]
                                            )
                                        }}>Add a checklist item</Button>
                                    </>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="stakeholders"
                        render={({field}) => (
                            <FormItem className="flex flex-col grow">
                                <FormLabel className="text-xl">{`Stakeholders`}</FormLabel>
                                <FormControl>
                                    <MultipleSelector 
                                        {...field}
                                        showHoverCard={false}
                                        placeholder="Select stakeholders..."
                                        options={fetchedMembers ? fetchedMembers?.map((member: User) => ({
                                            value: member.id || "",
                                            label: member.name || ""
                                        })): []}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField 
                        control={form.control}
                        name="milestone"
                        render={({ field }) => (
                            <FormItem className="h-full grow">
                                <FormLabel className="text-xl">{`Milestone`}</FormLabel>
                                <Select
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Link to a milestone" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {fetchedMilestones.map((m: Milestone, index: number) => (
                                            <SelectItem value={m.id} key={index}>
                                                {m.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />   

                    <FormField 
                        control={form.control}
                        name="targetDate"
                        render={({ field }) => (
                            <FormItem className="h-full grow">
                                <FormLabel className="text-xl">{`Target Date`}</FormLabel>
                                <Popover >
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value || new Date()}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />

                    <FormField 
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem className="h-full grow">
                                <FormLabel className="text-xl">{`Priority`}</FormLabel>
                                <Select
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="LOW">
                                            Low
                                        </SelectItem>
                                        <SelectItem value="MEDIUM">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="HIGH">
                                            High
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />   

                    <span className="flex justify-end gap-4 flex-wrap">
                        <Dialog>
                            <DialogTrigger>
                                <Button type="button" variant={"destructive"}>
                                    Delete Task
                                </Button>
                            </DialogTrigger>
                            <DeleteTaskDialogContent taskData={taskData}/>
                        </Dialog>
                        <DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogClose>
                    </span>
                </form>
            </ScrollArea>
        </Form>
    )
}

const ChecklistField = ({
                            index,
                            item,
                            onDelete,
                            onNameChange,
                            onCompleteChange
                        }: {
    index: number
    item: any
    onDelete: () => void
    onNameChange: (newName: string) => void
    onCompleteChange: (complete: boolean) => void
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id: item.id})

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

    const variants = cva("rounded-lg w-full flex flex-row items-center gap-2", {
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
                <span className="sr-only">Move checklist item</span>
                <GripVertical/>
            </Button>
            <Checkbox checked={item.complete} onCheckedChange={onCompleteChange}/>
            <div className="grow">
                <Input
                    type="text"
                    value={item.name}
                    onChange={nameChanged}
                    className="h-full"
                />
            </div>
            <Button variant="secondary" size="icon" onClick={deleteTask}>
                <FaTrash/>
            </Button>
        </li>
    )
}
