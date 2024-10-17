"use client"

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
import { RoadmapState, useRoadmapStore } from '@/state/roadmap/roadmapStore'
import { useShallow } from 'zustand/react/shallow'
import type { TaskType } from './milestone-node'
import type { StatusType } from './milestone-status-button'
import { FaDollarSign, FaTrash } from 'react-icons/fa6'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { DialogClose } from '@radix-ui/react-dialog'
import { useReactFlow } from '@xyflow/react'

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
    stakeholders: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
    tasks: z.array(
        z.object({
            name: z.string(),
            complete: z.boolean()
        })
    ).optional(),
    dependencies: z.array(z.string()).optional(),
    notes: z.string().optional(),
    status: z.string()
})

const selector = (state: RoadmapState) => ({
    setSelectedNodeId: state.setSelectedNodeId,
    onNodesChange: state.onNodesChange,
    setMilestone: state.setMilestone,
})

const monthsList = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

const today = new Date()

const getYearsList = () => {
    const currentYear = today.getFullYear()
    let years = []

    for (let i = currentYear-100; i <= currentYear+100; i++) {
        years.push(i.toString())
    }

    return years
}

export function EditMilestoneForm({ milestoneData }: { milestoneData: any }) {
    const { 
        setSelectedNodeId,
        onNodesChange,
        setMilestone,
    } = useRoadmapStore( useShallow(selector) )
    
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
            notes: milestoneData?.notes || "",
            status: milestoneData?.status || "TODO"
        }
    })

    const title = form.watch("title")
    const description = form.watch("description")
    const timelineMonth = form.watch("timelineMonth")
    const timelineYear = form.watch("timelineYear")
    const budget = form.watch("budget")
    const papers = form.watch("papers")
    const stakeholders = form.watch("stakeholders")
    const labels = form.watch("labels")
    const tasks = form.watch("tasks")
    const dependencies = form.watch("dependencies")
    const notes = form.watch("notes")
    const status = form.watch("status")

    const handleMilestoneFormSubmit = () => {
        console.log(`Handle Milstone Form Submit... `)
        console.log({
            id: milestoneData?.id || 'no id set',
            nodeId: milestoneData?.nodeId || 'no associated node', 
            title,
            description,
            timelineMonth,
            timelineYear,
            budget,
            tasks,
            // notes,
            status
        })
        setMilestone(
            milestoneData?.nodeId,
            {
                title,
                ...(description !== undefined && description !== null ? { description } : undefined),
                ...(timelineMonth ? { timelineMonth } : undefined),
                ...(timelineYear ? { timelineYear } : undefined),
                ...(budget ? { budget } : undefined),
                papers,
                // ...(notes ? { notes } : undefined),
                tasks,
                status
            }
        )
    }

    const handleDeleteMilestone = (e: React.MouseEvent<HTMLElement>) => {
        console.log(`handle Milestone delete...`)
        onNodesChange([{ id: milestoneData?.nodeId, type: 'remove' }])
        setSelectedNodeId(null)
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
                                <MilestoneStatusButton
                                    milestoneStatus={field?.value as StatusType} 
                                    onStatusChange={(status) => form.setValue('status', status)}
                                    {...field}
                                />
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
                                    placeholder={`Enter a title`}
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
                                    placeholder={`Enter a description`}
                                    defaultValue={field.value}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage/>
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
                        <FormItem className='grow'>
                            <FormLabel>{`Month:`}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a month" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {monthsList.map((month: string) => (
                                        <SelectItem value={month}>{month}</SelectItem>
                                    ))}
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
                        <FormItem className='grow'>
                            <FormLabel>{`Year:`}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a year" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {getYearsList().map((year: string) => (
                                        <SelectItem value={year}>{year}</SelectItem>
                                    ))}
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
                                <FaDollarSign size={24}/>
                                <Input
                                    id="budget"
                                    type="number"
                                    placeholder={`Enter a number`}
                                    defaultValue={field.value}
                                    // value={field.value}
                                    onChange={(e)=> field.onChange(Number(e.target.value))}
                                />
                                </span>
                            </FormControl>
                            <FormMessage/>
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
                                    {field?.value?.map((link, index) => ( 
                                        <PaperField 
                                            index={index} 
                                            value={link} 
                                            onDelete={() => (
                                                form.setValue('papers', field?.value?.filter((t, i) => i !== index))
                                            )}
                                            onValueChange={(newValue) => {
                                                form.setValue('papers', field?.value?.map((currentValue, i) => i === index ? newValue : currentValue))
                                            }}
                                        />
                                    ))}
                                </ul>
                                <Button onClick={(e: any) => {
                                    e.preventDefault()
                                    form.setValue(
                                        'papers',
                                        [...field?.value || [], ""]
                                    )
                                }}>{`Add an Associated Paper`}</Button>
                                </>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                {/* <FormField
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
                /> */}

                {/* <FormField
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
                /> */}
            
                {/* <FormField
                    control={form.control}
                    name="tasks"
                    render={({ field }) => (
                        <FormItem className="flex flex-col grow">
                            <FormLabel className="text-xl">{`Tasks:`}</FormLabel>
                            <FormControl>
                                <>
                                <ul className="flex flex-col gap-2"> 
                                    {field?.value?.map((task, index) => ( 
                                        <TaskField 
                                            index={index} 
                                            task={task} 
                                            onDelete={() => (
                                                form.setValue('tasks', field?.value?.filter((t, i) => i !== index))
                                            )}
                                            onNameChange={(newName) => {
                                                form.setValue('tasks', field?.value?.map((t, i) => i === index ? {...t, name: newName} : t))
                                            }}
                                            onCompleteChange={(complete) => {
                                                form.setValue('tasks', field?.value?.map((t, i) => i === index ? {...t, complete} : t))
                                            }}
                                        />
                                    ))}
                                </ul>
                                <Button onClick={(e: any) => {
                                    e.preventDefault()
                                    form.setValue(
                                        'tasks',
                                        [...field?.value || [], { name: 'New Task', complete: false }]
                                    )
                                }}>Add a task</Button>
                                </>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                /> */}
                
                {/* <FormField
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
                /> */}

                {/* <FormField
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
                /> */}

                <span className="flex justify-end gap-4 flex-wrap">
                    <Dialog>
                        <DialogTrigger>
                            <Button type="button" variant={'destructive'}>Delete Milestone</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete your milestone and it's data.
                            </DialogDescription>
                            <DialogFooter>
                                <DialogClose>
                                    <Button type="button">Cancel</Button>
                                </DialogClose>
                                <DialogClose>
                                    <Button type="button" variant={'destructive'} onClick={handleDeleteMilestone}>Delete Milestone</Button>
                                </DialogClose>
                            </DialogFooter>
                            </DialogHeader>
                        </DialogContent>
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
    index: number,
    value: string,
    onDelete: () => void, 
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
            <Input placeholder={`Enter a link to the associated paper`} value={value} onChange={valueChanged}/>
            <Button size="icon" onClick={deleteElement}><FaTrash /></Button>
        </li>
    )
}

const TaskField = ({ 
    index, 
    task, 
    onDelete, 
    onNameChange, 
    onCompleteChange 
}: { 
    index: number, 
    task: TaskType, 
    onDelete: () => void, 
    onNameChange: (newName: string) => void, 
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
            <TaskStatusButton complete={task.complete} onClick={(complete) => onCompleteChange(complete)} />
            <Input placeholder={task.name} value={task.name} onChange={nameChanged}/>
            <Button size="icon" onClick={deleteTask}><FaTrash /></Button>
        </li>
    )
}
