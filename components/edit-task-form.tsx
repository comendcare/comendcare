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
} from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import type { StatusType } from "./milestone-status-button"
import {
    Dialog,
    DialogTrigger
} from "./ui/dialog"
import { DeleteTaskDialogContent } from "./delete-task-dialog-content"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import StatusButton from "./milestone-status-button"
import { nanoid } from "nanoid"
import { FaTrash } from "react-icons/fa6"
import { Checkbox } from "./ui/checkbox"
import { toast } from "sonner"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { GripVertical } from "lucide-react"
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
import { cva } from "class-variance-authority"

const statusTypeSchema: z.ZodType<StatusType> = z.enum(['TODO', 'INPROGRESS', 'DONE'])

const editTaskForm = z.object({
    name: z
        .string({
            required_error: "Please provide a name"
        })
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),
    status: statusTypeSchema,
    description: z.string().optional(),
    checklist: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            complete: z.boolean(),
        })
    ).optional()
})

const selector = (state: RoadmapState) => ({
    setTask: state.setTask
})

export function EditTaskForm({
    // milestoneId,
    taskData,
    onClose
}: {
    // milestoneId: string
    taskData: any
    onClose: () => void
}) {
    const { setTask } = useRoadmapStore(useShallow(selector))
    const form = useForm<z.infer<typeof editTaskForm>>({
        mode: "onChange",
        resolver: zodResolver(editTaskForm),
        defaultValues: {
            name: taskData?.name,
            status: taskData?.status,
            description: taskData?.description || undefined,
            checklist: taskData?.checklist || undefined
        }
    })

    const name = form.watch("name")
    const status = form.watch("status")
    const description = form.watch("description")
    const checklist = form.watch("checklist")

    const handleFormSubmit = () => {
        console.log(`Handle Task Form Submit... `)
        console.log({
            id: taskData?.id || "no id set",
            name,
            status,
            description,
            checklist
        })
        setTask(
            taskData?.id,
            {
                name,
                status,
                ...(description ? { description } : undefined),
                ...(checklist 
                    ? { checklist: checklist.map((item, index) => ({...item, orderPosition: index})) } 
                    : undefined)
            }
        )
        toast('Success!', {
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

    return (
        <Form {...form}>
        <ScrollArea>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="flex flex-col gap-8 pr-4"
            >
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem className="flex flex-col grow">
                        <FormLabel className="text-xl">{`Task Status:`}</FormLabel>
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
                name="name"
                render={({ field }) => (
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

                <FormField
                control={form.control}
                name="checklist"
                render={({ field }) => (
                    <FormItem className="flex flex-col grow">
                        <FormLabel className="text-xl">{`Checklist:`}</FormLabel>
                        <FormControl>
                            <>
                            <DndContext collisionDetection={closestCorners} sensors={sensors} onDragEnd={(event) => {
                                const { active, over } = event

                                if (active.id === over?.id) return

                                const originalPosition = field?.value?.findIndex(item => item.id === active.id) || 0
                                const newPosition = field?.value?.findIndex(item => item.id === over?.id) || 0

                                form.setValue('checklist', arrayMove(field?.value || [], originalPosition, newPosition))
                            }}>
                            <ol className="flex flex-col gap-2">
                                <SortableContext items={field?.value?.map(item => item.id) || []} strategy={verticalListSortingStrategy}>
                                {field?.value?.map((checklistItem, index) => (
                                    <ChecklistField 
                                        key={checklistItem.id}
                                        index={index}
                                        item={checklistItem}
                                        onDelete={() => (
                                            form.setValue('checklist', field?.value?.filter((t, i) => i !== index))
                                        )}
                                        onNameChange={(name) => {
                                            form.setValue('checklist', field?.value?.map((t, i) => i === index ? {...t, name} : t))
                                        }}
                                        onCompleteChange={(complete) => {
                                            form.setValue('checklist', field?.value?.map((t, i) => i === index ? {...t, complete} : t))
                                        }}
                                    />
                                ))}
                                </SortableContext>
                            </ol>
                            </DndContext>
                            <Button onClick={(e: any) => {
                                e.preventDefault()
                                form.setValue(
                                    'checklist',
                                    [...field?.value || [], { name: 'New Item', complete: false, id: nanoid() }]
                                )
                            }}>Add a checklist item</Button>
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
                                Delete Task
                            </Button>
                        </DialogTrigger>
                        <DeleteTaskDialogContent taskData={taskData}/>
                    </Dialog>
                    <Button type="submit">Save Changes</Button>
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
    } = useSortable({ id: item.id })

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
                <GripVertical />
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
            <Button size="icon" onClick={deleteTask}>
                <FaTrash />
            </Button>
        </li>
    )
}
