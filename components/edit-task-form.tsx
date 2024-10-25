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
import ChecklistCompleteButton from "./checklist-complete-button"
import { FaTrash } from "react-icons/fa6"

const statusTypeSchema: z.ZodType<StatusType> = z.enum(['TODO', 'INPROGRESS', 'DONE'])

const editTaskForm = z.object({
    name: z.string(),
    status: statusTypeSchema,
    description: z.string().optional(),
    checklist: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            complete: z.boolean()
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
                ...(checklist ? { checklist } : undefined)
            }
        )
        onClose()
    }

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
                            <ul className="flex flex-col gap-2">
                                {field?.value?.map((checklistItem, index) => (
                                    <ChecklistField 
                                        key={index}
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
                            </ul>
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
    const deleteTask = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault()
        onDelete()
    }

    const nameChanged = (e: React.FormEvent<HTMLInputElement>) => {
        onNameChange(e.currentTarget.value)
    }

    return (
        <li key={index} className="flex flex-row gap-2 items-center">
            <ChecklistCompleteButton complete={item.complete} onClick={onCompleteChange}/>
            <Input
                placeholder={item.name}
                value={item.name}
                onChange={nameChanged}
            />
            <Button size="icon" onClick={deleteTask}>
                <FaTrash />
            </Button>
        </li>
    )
}
