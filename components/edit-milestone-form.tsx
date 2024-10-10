import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormLabel, FormItem, FormMessage, FormDescription } from './ui/form'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import TaskStatusButton from './task-status-button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from './ui/calendar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import MultiSelect from './multi-select'
import { ScrollArea } from './ui/scroll-area'
import MilestoneStatusButton from './milestone-status-button'

const editMilestoneForm = z.object({
    title: z
        .string({
            required_error: "Please provide a name."
        })
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),
    description: z
        .string()
        .max(1000, "Description must be less than 1000 characters")
        .optional(),
    deadline: z.date().optional(),
    stakeholders: z.array(z.string()),
    labels: z.array(z.string()),
    subtasks: z.array(
        z.object({
            name: z.string(),
            complete: z.boolean()
        })
    ),
    dependencies: z.array(z.string()),
    budget: z.string().optional(),
    notes: z.string().optional(),
    status: z.string()
})

export default function EditMilestoneForm({ nodeData }: { nodeData: any }) {
    const form = useForm<z.infer<typeof editMilestoneForm>>({
        mode: "onChange",
        resolver: zodResolver(editMilestoneForm),
        defaultValues: {
            title: nodeData.title || "",
            description: nodeData.description || "",
            subtasks: nodeData.subtasks || [],
            notes: nodeData.notes || "",
            status: nodeData.status || "todo"
        }
    })

    const title = form.watch("title")
    const description = form.watch("description")
    const deadline = form.watch("deadline")
    const stakeholders = form.watch("stakeholders")
    const labels = form.watch("labels")
    const subtasks = form.watch("subtasks")
    const dependencies = form.watch("dependencies")
    const budget = form.watch("budget")
    const notes = form.watch("notes")
    const status = form.watch("status")

    const handleMilestoneFormSubmit = () => {
        console.log(`Handle Milstone Form Submit...`)
        // TODO: submit logic
    }
    
    return (
        <Form {...form}>
            <ScrollArea>
            <form onSubmit={form.handleSubmit(handleMilestoneFormSubmit)}  className='flex flex-col gap-8 pr-4'>
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl">{`Milestone Status:`}</FormLabel>
                            <FormControl>
                                <MilestoneStatusButton milestoneStatus={nodeData.status} {...field}/>
                            </FormControl>
                            <FormMessage/>
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
                            <FormLabel className="text-xl">{`Description:`}</FormLabel>
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
                    name="deadline"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl">{`Deadline:`}</FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[280px] justify-start text-left font-normal",
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
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="stakeholders"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl">{`Key Stakeholders:`}</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    items={[
                                        { id: 1, name: 'person 1' },
                                        { id: 2, name: 'person 2' }
                                    ]}
                                    maxSelectable={5}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="labels"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl">{`Labels:`}</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    items={[
                                        { id: 1, name: 'label 1' },
                                        { id: 2, name: 'label 2' }
                                    ]}
                                    maxSelectable={5}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

            
                <FormField
                    control={form.control}
                    name="subtasks"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl">{`Subtasks:`}</FormLabel>
                            <FormControl>
                                <>
                                <ul className="flex flex-col gap-2"> 
                                    {field.value.map((task, index) => (
                                        <li key={index} className="flex flex-row gap-2 items-center">
                                            <TaskStatusButton task={task} />
                                            <p>{task.name}</p>
                                        </li>
                                    ))}
                                </ul>
                                <Button onClick={() => {}}>Add a task</Button>
                                </>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="dependencies"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl">{`Dependencies:`}</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    items={[
                                        { id: 1, name: 'Milestone 1' },
                                        { id: 2, name: 'Milestone 2' }
                                    ]}
                                    maxSelectable={5}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl">{`Budget:`}</FormLabel>
                            <FormControl>
                                <Input
                                    id="budget"
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
                    name="notes"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl">{`Notes:`}</FormLabel>
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

                <span className="flex justify-between">
                    <Button type="submit">Save Changes</Button>
                </span>
            </form>
            </ScrollArea>
        </Form>
    )
}
