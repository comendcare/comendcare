import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormLabel, FormItem, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import TaskStatusButton from './task-status-button'

const editMilestoneForm = z.object({
    name: z
        .string({
            required_error: "Please provide a name."
        })
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),
    description: z
        .string({
            required_error: "Please provide a description."
        })
        .min(1, "Description is required")
        .max(1000, "Description must be less than 1000 characters"),
    tasks: z.array(
        z.object({
            name: z.string(),
            complete: z.boolean()
        })
    ),
    notes: z.string().optional()
})

export default function EditMilestoneForm({ nodeData }: { nodeData: any }) {
    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            name: nodeData.name,
            description: nodeData.description,
            tasks: nodeData.tasks,
            notes: nodeData.notes
        }
    })

    const name = form.watch("name")
    const description = form.watch("description")
    const tasks = form.watch("tasks")
    const notes = form.watch("notes")
    
    return (
        <Form {...form}>
            <form className='flex flex-col gap-4'>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel>{`Name:`}</FormLabel>
                            <FormControl>
                                <Input
                                    id="name"
                                    placeholder={field.value}
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
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel>{`Description:`}</FormLabel>
                            <FormControl>
                                <Textarea
                                    id="description"
                                    placeholder={field.value}
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
                    name="tasks"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel>{`Tasks:`}</FormLabel>
                            <FormControl>
                            <ul className="flex flex-col gap-2"> 
                                {field.value.map((task, index) => (
                                    <li key={index} className="flex flex-row gap-2 items-center">
                                        <TaskStatusButton task={task} />
                                        <p>{task.name}</p>
                                    </li>
                                ))}
                            </ul>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel>{`Notes:`}</FormLabel>
                            <FormControl>
                                <Textarea
                                    id="notes"
                                    placeholder={field.value}
                                    defaultValue={field.value}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}
