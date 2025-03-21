"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import React, {useCallback, useEffect, useMemo, useRef, useState} from "react"
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
import {ScrollArea, ScrollBar} from "./ui/scroll-area"
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
import {FaLinkSlash, FaPlus, FaTrash} from "react-icons/fa6"
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
import { Member, Milestone, TaskStakeholder, User } from "@prisma/client"
import { useSession } from "next-auth/react"
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "./ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "./ui/calendar"
import { PrivateBadge } from "./private-badge"
import { Switch } from "./ui/switch"
import {Separator} from "./ui/separator"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import { StatusType } from "@/lib/types"

const statusTypeSchema: z.ZodType<StatusType> = z.enum(['PLANNED', 'INPROGRESS', 'COMPLETED'])
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
    priority: z.string().optional(),
    private: z.boolean()
})

const selector = (state: KanbanState) => ({
    updateTask: state.updateTask
})

export function EditTaskForm({
    taskData,
    onClose,
    setSelectIsOpen,
}: {
    taskData: any
    onClose: () => void
    setSelectIsOpen: (open: boolean) => void
}) {
    const initializing = useRef(true)
    const { data: session } = useSession()
    const { updateTask } = useKanbanStore(useShallow(selector))
    const form = useForm<z.infer<typeof editTaskForm>>({
        mode: "onChange",
        resolver: zodResolver(editTaskForm),
        defaultValues: {
            name: taskData?.name,
            status: taskData?.status || 'PLANNED',
            description: JSON.parse(taskData?.description || "[]") || [],
            checklist: taskData?.checklist || undefined,
            stakeholders: taskData?.stakeholders?.map((stakeholder: any) => ({ value: stakeholder.userId, label: stakeholder.user?.name })) || [],
            milestone: taskData?.milestone?.id || undefined,
            targetDate: taskData?.endDate || undefined,
            priority: taskData?.priority || undefined,
            private: taskData?.private || false
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
            // Allow update once form is initialized
            initializing.current = false;
        }

        fetchData()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const formData = {
        name: form.watch("name"),
        status: form.watch("status"),
        description: form.watch("description"),
        checklist: form.watch("checklist"),
        stakeholders: form.watch("stakeholders"),
        milestone: form.watch("milestone"),
        targetDate: form.watch("targetDate"),
        priority: form.watch("priority"),
        isPrivate: form.watch("private"),
    }

    const handleFormSubmit = async (values: z.infer<typeof editTaskForm>) => {
        const {
            name,
            status,
            description,
            checklist,
            stakeholders,
            milestone,
            targetDate,
            priority,
            private: isPrivate
        } = values;

        const response = await getMembers(session?.user?.organizationId || undefined)
        let fetchedMembers: any[] = []
        if (response.success && response.data) fetchedMembers = response.data

        const stakeholderIds = stakeholders?.map(stakeholder => stakeholder.value)

        updateTask(
            taskData?.id,
            {
                name,
                status,
                ...(description ? {description: JSON.stringify(description)} : undefined),
                ...(checklist
                    ? {checklist: checklist.map((item, index) => ({...item, orderPosition: index}))}
                    : undefined),
                ...(stakeholders ? 
                    { 
                        stakeholders: 
                            fetchedMembers?.filter(member => stakeholderIds?.includes(member.userId)).map(member => ({
                                userId: member.userId,
                                user: member.user
                            }))
                    } : 
                    undefined
                ),
                milestone: { id: milestone },
                milestoneId: milestone,
                ...(targetDate ? { endDate: targetDate } : undefined),
                ...(priority ? { priority } : undefined),
                private: isPrivate || false
            }
        )
        // toast('Success!', {
        //     position: "bottom-left",
        //     description: 'The changes to your task have been successfully saved.'
        // })
        onClose()
    }

    const handleFormSubmitCallback = useCallback(
        handleFormSubmit, 
        [session?.user.organizationId, onClose, taskData?.id, updateTask]
    )

    // memo ensures we're not creating a new debounce every time this is called
    const debounceUpdates = useMemo(() => 
        debounce((updatedValues) => handleFormSubmitCallback(updatedValues), 500), 
        [handleFormSubmitCallback]
    )

    // Watch form changes, don't watch while initializing
    useEffect(() => {
        const subscription = form.watch((values) => debounceUpdates(values))
        return () => subscription.unsubscribe();
    }, [form.watch, debounceUpdates, form])

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    function getDraggedData(id: string) {
        const name = formData.checklist?.find(item => item.id === id)?.name
        const position = (formData.checklist?.findIndex(item => item.id === id) || 0) + 1
        const length = formData.checklist?.length || 0

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
                <ScrollBar />
                <form
                    onSubmit={form.handleSubmit(handleFormSubmit)}
                    className="flex flex-col gap-2 p-4 pt-0"
                >

                    {/* <FormField
                        control={form.control}
                        name="private"
                        render={({ field }) => (
                            <FormItem className="h-full flex items-end justify-end gap-2 -mt-2 h-8">
                                {field.value && (
                                    <PrivateBadge className="self-center mt-2"/>
                                )}
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormLabel className="pb-1">{`Private`}</FormLabel>
                                <FormMessage />
                            </FormItem>
                        )}
                    /> */}

                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem className="grid grid-cols-[180px_auto] gap-8 items-center w-full">
                                <FormLabel className="text-md mt-2">{`Name`}</FormLabel>
                                <FormControl>
                                    <Input
                                        className="h-10"
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
                        name="priority"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-[180px_auto] gap-8 items-center w-full" onClick={(e) => e.preventDefault()}>
                                <FormLabel className="text-md mt-2">{`Priority`}</FormLabel>
                                <Select
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                    onOpenChange={setSelectIsOpen}
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


                    <FormField 
                        control={form.control}
                        name="targetDate"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-[180px_auto] gap-8 items-center w-full">
                                <FormLabel className="text-md mt-2">{`Target Date`}</FormLabel>
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
                                            selected={field.value}
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
                        name="milestone"
                        render={({ field }) => (
                            <FormItem className="grid grid-cols-[180px_auto] gap-8 items-center w-full">
                                <FormLabel className="text-md mt-2">{`Associated Milestone`}</FormLabel>
                                <div className="flex flex-row gap-4">
                                    <Select
                                        value={formData.milestone || ''}
                                        onValueChange={field.onChange}
                                        onOpenChange={setSelectIsOpen}
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
                                    <Button 
                                        variant="secondary" 
                                        size="icon" 
                                        onClick={(e) => {
                                            e.preventDefault()
                                            form.setValue('milestone', undefined)
                                        }}
                                        disabled={!field.value}
                                    >
                                        <FaLinkSlash />
                                    </Button>
                                </div>
                            </FormItem>
                        )}
                    /> 

                    <FormField
                        control={form.control}
                        name="stakeholders"
                        render={({field}) => (
                            <FormItem className="grid grid-cols-[180px_auto] gap-8 items-center w-full">
                                <FormLabel className="text-md mt-2">{`Assignees`}</FormLabel>
                                <FormControl>
                                    <MultipleSelector
                                        {...field}
                                        showHoverCard={false}
                                        placeholder="Select assignees..."
                                        options={fetchedMembers ? fetchedMembers?.map((member: User) => ({
                                            value: member.id || "",
                                            label: member.name || ""
                                        })): []}
                                        emptyIndicator={
                                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                                no results found.
                                            </p>
                                        }
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />  

                    <Separator className="my-6" />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-xl">{`Description`}</FormLabel>
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

                    <Separator className="my-6" />

                    <FormField
                        control={form.control}
                        name="checklist"
                        render={({field}) => (
                            <FormItem className="grid grid-cols-[132px_auto] gap-8 items-start w-full">
                                <FormLabel className="text-xl mt-2">{`Checklist`}</FormLabel>
                                <FormControl>
                                    <div className="flex flex-col gap-2 items-end">
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
                                            <ol className="flex flex-col gap-2 w-full">
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
                                        <Tooltip delayDuration={0}>
                                            <TooltipTrigger asChild>
                                                <Button variant="secondary" size="icon" onClick={(e: any) => {
                                                        e.preventDefault()
                                                        form.setValue(
                                                            'checklist',
                                                            [...field?.value || [], {
                                                                name: 'New Item',
                                                                complete: false,
                                                                id: nanoid()
                                                            }]
                                                        )
                                                    }}>
                                                    <FaPlus />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Add a new checklist item</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <span className="flex justify-end gap-4 flex-wrap mt-4">
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
