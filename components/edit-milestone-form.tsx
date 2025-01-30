"use client"

import {zodResolver} from "@hookform/resolvers/zod"
import React, {useCallback, useEffect, useRef, useState} from "react"
import {useForm, UseFormReturn} from "react-hook-form"
import {z} from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormItem,
    FormMessage,
    FormDescription,
} from "./ui/form"
import {Input} from "./ui/input"
import {Textarea} from "./ui/textarea"
import {Button} from "./ui/button"
import {ScrollArea} from "./ui/scroll-area"
import StatusButton from "./milestone-status-button"
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import {FaCalendar, FaLinkSlash, FaX} from "react-icons/fa6"
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
import {DeleteMilestoneDialogContent} from "./delete-milestone-dialog-content"
import {toast} from "sonner"
import {
    DndContext,
    useSensor,
    useSensors,
    KeyboardSensor,
    Announcements,
    TouchSensor,
    MouseSensor,
    closestCorners,
    SensorDescriptor,
    SensorOptions
} from "@dnd-kit/core"
import {CSS} from "@dnd-kit/utilities"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable"
import {CalendarIcon, GripVertical} from "lucide-react"
import {cva} from "class-variance-authority"
import {Switch} from "./ui/switch"
import {PrivateBadge} from "./private-badge"
import {debounce} from "lodash"
import {monthsList} from "@/lib/data";
import {MILESTONE_TYPE_OPTIONS, NODE_TYPE_OPTIONS, RFP_OPEN_TO_TYPE_OPTIONS, StatusType} from "@/lib/types"
import {Organization, Prisma} from "@prisma/client"
import {Separator} from "./ui/separator"
// import {AssetEditForm} from "./asset-edit-form"
// import {RFPEditForm} from "./rfp-edit-form"
import {FaEdit} from "react-icons/fa"
import {KanbanState, useKanbanStore} from "@/state/kanban/kanbanStore"
import { getKanbanFromOrganizationId, getOrganizationFromOrganizationId } from "@/lib/fetchers"
import mixpanel from "mixpanel-browser"
import { useSession } from "next-auth/react"
import { AttachmentsEditForm } from "./attachments-edit-form"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { ExternalContactField } from "./external-contact-field"
import { ExternalAttachmentField } from "./external-attachment-field"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "./ui/calendar"

type AttachmentType = Prisma.ExternalAttachmentGetPayload<{}>
type ContactType = Prisma.ExternalContactGetPayload<{}>
type TaskType = Prisma.TaskGetPayload<{}>

// const statusTypeSchema: z.ZodType<StatusType> = z.enum(['PLANNED', 'INPROGRESS', 'COMPLETED'])
const SHOW_ACCESSIBILITY_MESSAGES = process.env.NODE_ENV === "development"

// const today = new Date()

// const getYearsList = () => {
//     const currentYear = today.getFullYear()
//     let years = []

//     for (let i = currentYear - 100; i <= currentYear + 100; i++) {
//         years.push(i.toString())
//     }

//     return years
// }

const selector = (state: RoadmapState) => ({
    setMilestone: state.setMilestone
})

const kanbanSelector = (state: KanbanState) => ({
    columns: state.columns,
    tasks: state.tasks,
    updateTask: state.updateTask,
    setTasks: state.setTasks,
    addTask: state.addTask,
    addColumn: state.addColumn
})

const editMilestoneForm = z.object({
    nodeType: z.string(),
    title: z
        .string({
            required_error: "Please provide a title"
        })
        .min(1, "Title is required")
        .max(100, "Title must be less than 100 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    type: z.string(),
    otherTypeDetails: z.string().optional(),
    startDate: z.object({
        month: z.string().optional(),
        year: z.string().min(4, "Year must be 4 digits").max(4, "Year must be 4 digits").optional(),
    }),
    endDate: z.object({
        month: z.string().optional(),
        year: z.string().min(4, "Year must be 4 digits").max(4, "Year must be 4 digits").optional()
    }),
    budget: z.number().optional(),
    attachments: z.array(z.custom<AttachmentType>()).optional(),
    tasks: z.array(z.custom<TaskType>()).optional(),
    status: z.string(),
    private: z.boolean(),
    contacts: z.array(z.custom<any>()).optional(),
    openTo: z.string().optional(),
})

export function EditMilestoneForm({
                                      milestoneData,
                                      onClose
                                  }: {
    milestoneData: any
    onClose: () => void
}) {
    const {setMilestone} = useRoadmapStore(
        useShallow(selector)
    )
    const {
        columns: kanbanColumns,
        tasks: kanbanTasks,
        updateTask,
        setTasks,
        addTask,
        addColumn
    } = useKanbanStore(useShallow(kanbanSelector))
    const initializing = useRef(true)
    const {data: session} = useSession()

    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            nodeType: milestoneData?.node.type || "MILESTONE",
            title: milestoneData?.title || "",
            description: milestoneData?.description || "",
            type: milestoneData?.type || "NOTYPE",
            otherTypeDetails: milestoneData?.otherTypeDetails || undefined,
            startDate: {
                month: milestoneData?.startDate?.getMonth() ? monthsList[milestoneData?.startDate?.getMonth()] : undefined,
                year: milestoneData?.startDate?.getFullYear()?.toString() || undefined
            },
            endDate: {
                month: milestoneData?.endDate?.getMonth() ? monthsList[milestoneData?.endDate?.getMonth()] : undefined,
                year: milestoneData?.endDate?.getFullYear()?.toString() || undefined
            },
            budget: milestoneData?.budget || undefined,
            attachments: milestoneData?.attachments || undefined,
            tasks: kanbanTasks?.filter((task: any) => task.milestoneId && task.milestoneId === milestoneData?.id) || [],
            status: milestoneData?.status || "PLANNED",
            private: milestoneData?.private || false,
            contacts: milestoneData?.contacts || undefined,
            openTo: milestoneData?.openTo || undefined
        }
    })

    const formData = {
        nodeType: form.watch("nodeType"),
        title: form.watch("title"),
        description: form.watch("description"),
        type: form.watch("type"),
        otherTypeDetails: form.watch("otherTypeDetails"),
        startDate: form.watch("startDate"),
        endDate: form.watch("endDate"),
        budget: form.watch("budget"),
        attachments: form.watch("attachments"),
        tasks: form.watch("tasks"),
        status: form.watch("status"),
        isPrivate: form.watch("private"),
        contacts: form.watch("contacts"),
        openTo: form.watch("openTo")
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

    const unionById = (arr1: any[], arr2: any[]) => {
        const map = new Map();
      
        // Add elements from the first array
        arr1.forEach((item) => map.set(item.id, item));
      
        // Add elements from the second array (overwriting duplicates)
        arr2.forEach((item) => map.set(item.id, item));
      
        // Convert the Map back to an array
        return Array.from(map.values());
      };

    const handleMilestoneFormSubmit = async (values: z.infer<typeof editMilestoneForm>) => {
        const {
            nodeType,
            title,
            description,
            type,
            otherTypeDetails,
            startDate,
            endDate,
            budget,
            attachments,
            tasks,
            status,
            private: isPrivate,
            contacts,
            openTo
        } = values;
        const now = new Date()

        setMilestone(milestoneData?.nodeId, {
            nodeType,
            title,
            ...(description !== undefined && description !== null
                ? {description}
                : undefined),
            ...(startDate.month !== undefined || startDate.year !== undefined ? {
                startDate: new Date(
                    startDate.year ? Number.parseInt(startDate.year) : now.getFullYear(),
                    startDate.month ? monthsList.findIndex(month => month === startDate.month) : 0,
                    1
                )
            } : undefined),
            ...(endDate.month !== undefined || endDate.year !== undefined ? {
                endDate: new Date(
                    endDate.year ? Number.parseInt(endDate.year) : now.getFullYear(),
                    endDate.month ? monthsList.findIndex(month => month === endDate.month) : 0,
                    1
                )
            } : undefined),
            ...(budget ? {budget} : undefined),
            ...(attachments
                    ? {attachments}
                    : undefined
            ),
            ...(type
                    ? {type}
                    : {type: 'NOTYPE'}
            ),
            ...(otherTypeDetails !== undefined && otherTypeDetails !== null
                ? {otherTypeDetails}
                : undefined
            ),
            status,
            private: isPrivate || false,
            ...(contacts
                ? {contacts}
                : undefined
            ),
            ...(openTo
                ? {openTo}
                : undefined
            )
        })

        setTasks(unionById(tasks || [], kanbanTasks).map(task => {
            const newTask = tasks?.find(t => t.id === task.id)

            // link relevant tasks to this milestone
            if (newTask) {
                return {
                    ...task,
                    name: newTask.name,
                    columnId: newTask.columnId,
                    milestone: {id: milestoneData?.id},
                    milestoneId: milestoneData?.id,
                }
            }

            // unlink tasks that are no longer attached to this milestone
            if (!newTask && milestoneData?.id && task.milestoneId === milestoneData.id) {
                return {
                    ...task,
                    milestone: undefined,
                    milestoneId: undefined
                }
            }

            return task
        }))

        // Mixpanel tracking for "Other" field
        // only send to mixpanel if the details explaining the 'other' type have been updated
        if (otherTypeDetails && otherTypeDetails !== milestoneData?.otherTypeDetails && session?.user.organizationId) {
            const response = await getOrganizationFromOrganizationId(session?.user.organizationId)

            // console.log(`track mixpanel event`, {
            //     name: "Milestone has other type",
            //     orgName: response?.data?.name || "Unknown Org",
            //     milestoneTitle: title,
            //     milestoneType: otherTypeDetails,
            // })
            mixpanel.track("Milestone has other type", {
                orgName: response?.data?.name || "Unknown Org",
                milestoneTitle: title,
                milestoneType: otherTypeDetails,
            });
        }

        // toast('Success!', {
        //     position: "bottom-left",
        //     description: 'The changes to your milestone have been successfully saved.'
        // })
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

        return {name, position, length}
    }

    const announcements: Announcements = {
        onDragStart({active}) {
            const data = getDraggedData(active?.id.toString())
            const message = `Picked up task ${data.name} at position ${data.position} of ${data.length}`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
        onDragOver({active, over}) {
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
        onDragEnd({active, over}) {
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
        onDragCancel({active}) {
            const activeData = getDraggedData(active?.id.toString())
            const message = `Dragging was cancelled. Task ${activeData.name} was dropped.`
            if (SHOW_ACCESSIBILITY_MESSAGES) console.log(message)
            return message
        },
    }

    return (
        <Form {...form}>
            <ScrollArea className="research-plan-tour-step3 px-8 pb-4">
                <form
                    onSubmit={form.handleSubmit(handleMilestoneFormSubmit)}
                    // onChange={() => console.log(`CHANGE`)}
                    className="flex flex-col gap-8 mt-2 px-1"
                >
                    <Button className="z-[9999] absolute top-0 right-0 mx-4 my-2" variant="secondary" onClick={onClose}>
                        <FaX/>
                    </Button>

                    <FormItem className="w-full flex flex-row gap-4 justify-start items-center mr-10">
                        <FormLabel className="text-md mt-2">Private</FormLabel>
                        <PrivatePublicFormField form={form} formData={formData} />
                    </FormItem>

                    <EditTitle form={form}/>

                    <FormField
                        control={form.control}
                        name="nodeType"
                        render={({field}) => (
                            <FormItem className="flex flex-row items-center justify-between gap-4 flex-wrap grow">
                                <FormControl>
                                    <ToggleGroup
                                        type="single"
                                        variant="outline"
                                        value={field.value}
                                        onValueChange={
                                            field.onChange
                                        }
                                        className="w-full flex flex-wrap gap-2 justify-between"
                                    >
                                        {NODE_TYPE_OPTIONS.map(({label, value}) => (
                                            <ToggleGroupItem
                                                key={value}
                                                value={value}
                                                className={"text-md grow"}
                                            >
                                                {label}
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
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
                                <FormLabel
                                    className="text-2xl font-semibold leading-none tracking-tight">{`Description`}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        id="description"
                                        placeholder={`Enter a description`}
                                        defaultValue={field.value}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <Separator />

                    {milestoneData?.node?.type === "MILESTONE" && (
                        <>
                            <FormItem className="w-full grid grid-cols-[150px_auto] gap-4 items-center">
                                <FormLabel className="text-md">{`Milestone Type`}</FormLabel>
                                <MilestoneTypeFormField form={form} />

                                <FormLabel className="text-md">{`Milestone Status`}</FormLabel>
                                <StatusFormField form={form} />

                                <FormLabel className="text-md">{`Budget`}</FormLabel>
                                <BudgetFormField form={form} />
                            </FormItem>

                            <Separator/>

                            <TimelineFormField 
                                form={form}
                            />

                            <Separator />
                        </>
                    )}

                    {milestoneData?.node?.type === "PROJECT" && (
                        <>
                        <Separator />
                        <OpenToFormField form={form}/>
                        </>
                    )}

                    <AttachmentsFormField
                        form={form}
                        attachments={formData.attachments as AttachmentType[]}
                    />

                    <Separator />
                    <ContactsFormField form={form} />

                    <Separator />

                    <TasksFormField 
                        form={form}
                        formData={formData}
                        announcements={announcements}
                        sensors={sensors}
                        milestoneData={milestoneData}
                    />

                    <span className="h-4">

                    </span>

                    <span className="z-[9999] flex justify-end gap-4 flex-wrap absolute bottom-0 right-0 mx-4 my-2">
                        <Dialog>
                            <DialogTrigger>
                                <Button type="button" variant="destructive">
                                    Delete Milestone
                                </Button>
                            </DialogTrigger>
                            <DeleteMilestoneDialogContent milestoneData={milestoneData}/>
                        </Dialog>
                        <Button 
                            id="edit-milestone-scroll-area" 
                            className="research-plan-tour-step4"
                            onClick={() => {
                                handleMilestoneFormSubmit(form.getValues())
                                onClose()
                            }}
                        >
                            Save Changes
                        </Button>
                    </span>
                </form>
            </ScrollArea>
        </Form>
    )
}

const MilestoneTypeFormField = ({form}: {form: any}) => {
    return (
        <>
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
                                    <SelectValue placeholder="Select a milestone type..."/>
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

            {form.watch("type") === "OTHER" && (
                <>
                <div>
                <FormLabel className="text-md">{`Type Description`}</FormLabel>
                <FormDescription>{`This will be used to improve the platform.`}</FormDescription>
                </div>
                <FormField
                    control={form.control}
                    name="otherTypeDetails"
                    render={({field}) => (
                        <FormItem className="flex flex-col grow">
                            <FormControl>
                                <Textarea
                                    id="otherTypeDetails"
                                    placeholder={`Please enter a short description of your milestone type.`}
                                    defaultValue={field.value}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                </>
            )}
        </>
    )
}

const PrivatePublicFormField = ({form, formData}: {form: any, formData: any}) => {
    return (
        <FormField
            control={form.control}
            name="private"
            render={({field}) => (
                <span className="h-full items-center flex flex-row justify-end gap-4">
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    {formData.isPrivate && (
                        <PrivateBadge className="mt-0"/>
                    )}
                    <FormMessage/>
                </span>
            )}
        />
    )
}

const StatusFormField = ({form}: {form: any}) => {
    return (
        <FormField
            control={form.control}
            name="status"
            render={({field}) => (
                <FormItem className="h-full flex items-center justify-end gap-4">
                    <FormControl className="h-full">
                        <StatusButton
                            status={
                                field?.value as StatusType
                            }
                            onStatusChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

const BudgetFormField = ({form}: {form: any}) => {
    return (
        <FormField
            control={form.control}
            name="budget"
            render={({field}) => (
                <FormItem className="h-full flex items-center justify-end gap-4">
                    <FormControl className="grow w-full h-full">
                        <Input
                            className="h-full"
                            id="budget"
                            type="number"
                            defaultValue={field.value}
                            onChange={e =>
                                field.onChange(
                                    Number(e.target.value)
                                )
                            }
                            variant={"currency"}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

const TimelineFormField = ({
    form
}: {
    form: any
}) => {
    return (
        <span className="flex flex-col gap-2 align-center">
        <FormLabel
            className="text-2xl font-semibold leading-none tracking-tight">{`Timeline`}</FormLabel>

        <FormItem className="w-full grid grid-cols-[50px_auto_auto] gap-4 items-center">
            <FormLabel className="text-md">{`Start`}</FormLabel>
            <FormField
                control={form.control}
                name="startDate.month"
                render={({field}) => (
                    <FormItem className="h-full grow">
                        <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a month"/>
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
                render={({field}) => (
                    <FormItem className="h-full grow">
                        <Input
                            className="h-full"
                            placeholder="Enter a year..."
                            defaultValue={field.value}
                            {...field}
                        />
                    </FormItem>
                )}
            />

            <FormLabel className="text-md">{`End`}</FormLabel>
            <FormField
                control={form.control}
                name="endDate.month"
                render={({field}) => (
                    <FormItem className="h-full grow">
                        <Select
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a month"/>
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
                render={({field}) => (
                    <FormItem className="h-full grow">
                        <Input
                            className="h-full"
                            placeholder="Enter a year..."
                            defaultValue={field.value}
                            {...field}
                        />
                    </FormItem>
                )}
            />
            <FormMessage/>
        </FormItem>
    </span>
    )
}

const StartDateFormField = ({form}: {form: any}) => {
    return (
        <FormField 
            control={form.control}
            name="startDate"
            render={({field}) => (
                <Popover >
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        <FaCalendar className="mr-2 h-4 w-4" />
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
            )}
        />
    )
}

const OpenToFormField = ({form}: {form: any}) => {
    return (
        <FormItem className="w-full grid grid-cols-[80px_auto] items-center gap-4">
            <FormLabel className="text-md mt-2">{`Open to`}</FormLabel>
            <FormField 
                control={form.control}
                name="openTo"
                render={({field}) => (
                    <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Open to work from..." />
                        </SelectTrigger>
                        <SelectContent>
                            {RFP_OPEN_TO_TYPE_OPTIONS.map((type, index) => (
                                <SelectItem key={index} value={type.value}>{type.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
        </FormItem>
    )
}

const TasksFormField = ({
    form, 
    formData, 
    announcements, 
    sensors, 
    milestoneData
}: { 
    form: any, 
    // formData: z.infer<typeof editMilestoneForm>,
    formData: any, 
    announcements: Announcements, 
    sensors: SensorDescriptor<SensorOptions>[], 
    milestoneData: any
}) => {
    const {
        columns: kanbanColumns,
        tasks: kanbanTasks,
        updateTask,
        setTasks,
        addTask,
        addColumn
    } = useKanbanStore(useShallow(kanbanSelector))

    return (
        <FormField
            control={form.control}
            name="tasks"
            render={({field}) => (
                <FormItem className="flex flex-col grow">
                    <FormControl>
                        <>
                            {formData.tasks && formData.tasks.length > 0 && (
                                <>
                                    <FormLabel
                                        className="text-2xl font-semibold leading-none tracking-tight">{`Tasks`}</FormLabel>
                                    <DndContext
                                        accessibility={{
                                            announcements
                                        }}
                                        collisionDetection={closestCorners}
                                        sensors={sensors}
                                        onDragEnd={(event) => {
                                            const {active, over} = event

                                            if (active.id === over?.id) return

                                            const originalPosition = field?.value?.findIndex((item: any) => item.id === active.id) || 0
                                            const newPosition = field?.value?.findIndex((item: any) => item.id === over?.id) || 0

                                            form.setValue('tasks', arrayMove(field?.value || [], originalPosition, newPosition))
                                        }}
                                    >
                                        <ol className="flex flex-col gap-2">
                                            <SortableContext
                                                items={field?.value?.map((item: any) => item.id) || []}
                                                strategy={verticalListSortingStrategy}>
                                                {field?.value?.map((task: any, index: number) => (
                                                    <TaskField
                                                        key={task.id}
                                                        index={index}
                                                        task={task}
                                                        onUnlink={() => {
                                                            form.setValue('tasks', field?.value?.filter((t: any, i: number) => i !== index))
                                                        }}
                                                        onNameChange={(newName) => {
                                                            form.setValue('tasks', field?.value?.map((t: any, i: number) => i === index ? {
                                                                ...t,
                                                                name: newName
                                                            } : t))
                                                        }}
                                                        onColumnChange={(newColumnId) => {
                                                            form.setValue('tasks', field?.value?.map((t: any, i: number) => i === index ? {
                                                                ...t,
                                                                columnId: newColumnId
                                                            } : t))
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
                                            milestone: {id: milestoneData?.id}
                                        }]
                                    )
                                }}
                            />
                            
                            <Button
                                variant={'secondary'}
                                onClick={async (e) => {
                                    e.preventDefault()
                                    // if kanban doesn't exist or kanban has no columns
                                    if (kanbanColumns.length === 0) {
                                        const response = await getKanbanFromOrganizationId()

                                        if (response.success && response.data) {
                                            // kanban found, add column
                                            const column = await addColumn({
                                                name: 'Unsorted Tasks'
                                            })

                                            if (!column) return

                                            const newTask = await addTask(column.id)
                                            if (newTask) {
                                                const updatedTasks = [...form.getValues().tasks || [], {
                                                    ...newTask,
                                                    milestoneId: milestoneData?.id,
                                                    milestone: {id: milestoneData?.id}
                                                }]
                                                form.setValue('tasks', updatedTasks)
                                            }

                                            return
                                        }
                                    }

                                    const columnId = kanbanColumns[0].id

                                    const newTask = await addTask(columnId)
                                    if (newTask) {
                                        const updatedTasks = [...form.getValues().tasks || [], {
                                            ...newTask,
                                            milestoneId: milestoneData?.id,
                                            milestone: {id: milestoneData?.id}
                                        }]
                                        form.setValue('tasks', updatedTasks)
                                    }
                                }}
                            >
                                {`Add a new kanban task`}
                            </Button>
                        </>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

export function AttachmentsFormField({ form, attachments }: { form: UseFormReturn<any>, attachments: AttachmentType[] }) {
    return (
        <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => (
                <FormItem className="flex flex-col grow">
                    <FormControl>
                        <>
                        {attachments && attachments.length > 0 && (
                            <>
                                {field.value.length > 0 && <FormLabel className="text-2xl font-semibold leading-none tracking-tight">{`Associated Attachments`}</FormLabel>}
                                {field.value.length > 0 && (
                                    <ol className="flex flex-col gap-2">
                                        {field.value.map((paper: AttachmentType, index: number) => (
                                            <ExternalAttachmentField 
                                                key={index}
                                                index={index}
                                                value={paper}
                                                onDelete={() => {
                                                    form.setValue(
                                                        "attachments",
                                                        field?.value?.filter((t: AttachmentType, i: number) => i !== index)
                                                    )
                                                }}
                                                onValueChange={newValue => {
                                                    form.setValue(
                                                        "attachments",
                                                        field?.value?.map((currentValue: AttachmentType, i: number) => i === index ? newValue : currentValue)
                                                    )
                                                }}
                                            />
                                        ))}
                                    </ol>
                                )}
                            </>
                        )}
                        <Button
                            variant="secondary"
                            onClick={(e: any) => {
                                e.preventDefault()
                                form.setValue("attachments", [
                                    ...(field?.value || []),
                                    { name: '', link: '' }
                                ])
                            }}
                        >{`Add an attachment`}</Button>
                        </>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />
    )
}

const ContactsFormField = ({form}: {form: any}) => {
    return (
        <FormField 
            control={form.control}
            name="contacts"
            render={({field}) => (
                <>
                {field?.value && field.value.length > 0 && <FormLabel className="text-md">{`Contacts`}</FormLabel>}
                {field?.value && field.value.length > 0 && (
                    <ol className="flex flex-col gap-2">
                        {field.value.map((contact: ContactType, index: number) => (
                            <ExternalContactField 
                                key={index}
                                index={index}
                                value={contact}
                                onDelete={() => {
                                    form.setValue(
                                        "contacts",
                                        field?.value?.filter((t: ContactType, i: number) => i !== index)
                                    )
                                }}
                                onValueChange={newValue => {
                                    form.setValue(
                                        "contacts",
                                        field?.value?.map((currentValue: ContactType, i: number) => i === index ? newValue : currentValue)
                                    )
                                }}
                            />
                        ))}
                    </ol>
                )}
                <Button
                    variant="secondary"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault()
                        form.setValue("contacts", [
                            ...(field.value || []),
                            { name: "", email: "", role: null }
                        ])
                    }}
                >{`Add a contact`}</Button>
                </>
            )}
        />
    )
}

const EditTitle = ({form}: { form: any }) => {
    const contentRef = useRef<HTMLHeadingElement>(null);

    const handleInput = (e: React.FormEvent<HTMLHeadingElement>) => {
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        const cursorPosition = range ? range.startOffset : 0;

        // Update the form value without causing a re-render
        form.setValue("title", e.currentTarget.textContent || "");

        // Restore cursor position
        if (range && selection) {
            setTimeout(() => {
                const newRange = document.createRange();
                newRange.setStart(contentRef.current!.childNodes[0], cursorPosition);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }, 0);
        }
    };

    return (
        <FormField
            control={form.control}
            name="title"
            render={({field}) => (
                <FormItem className="flex flex-col grow">
                    <FormControl>
                        {/* <Textarea
                            className="min-h-fit max-h-fit font-semibold text-3xl"
                            id="title"
                            placeholder={`Enter a title`}
                            defaultValue={field.value}
                            {...field}
                        /> */}
                        <span className="flex flex-row gap-2 items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" >
                            <h1
                                id="title"
                                ref={contentRef}
                                className="text-3xl font-semibold w-full h-full focus:outline-none"
                                contentEditable
                                suppressContentEditableWarning
                                onInput={handleInput}
                            >
                                {field.value}
                            </h1>
                        </span>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
};

const LinkTask = ({milestoneId, kanbanTasks, onLink}: {
    milestoneId: string,
    kanbanTasks: any[],
    onLink: (id: string) => void
}) => {
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
            onClick={() => {
                setIsLinking(true)
            }}
        >
            {kanbanTasks?.filter((task: any) => task.milestoneId === milestoneId).length === 0 ? (
                `Link kanban task`
            ) : (
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
    } = useSortable({id: task.id || ""})
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
                <GripVertical/>
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
                <FaLinkSlash/>
            </Button>
        </li>
    )
}
