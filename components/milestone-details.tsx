"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
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
import { Label } from './ui/label'

export function MilestoneDetails({ milestoneData }: { milestoneData: any }) {
    
    return (
        <ScrollArea>
        <div className='flex flex-col gap-8 pr-4'>
            <div className="flex flex-col grow gap-2">
                <Label className="text-xl">Milestone Status:</Label>
                <MilestoneStatusButton 
                    milestoneStatus={milestoneData.status}
                    onStatusChange={() => {}}   // disabled
                />
            </div>

            <div className="flex flex-col grow gap-2">
                <Label htmlFor="title" className="text-xl">Title:</Label>
                <p id="title">{milestoneData.title || "No title set"}</p>
            </div>

            <div className="flex flex-col grow gap-2">
                <Label htmlFor="description" className="text-xl">Description:</Label>
                <p id="description">{milestoneData.description || "No description set"}</p>
            </div>

            <div className="flex flex-col grow gap-2">
                <Label htmlFor="timeline" className="text-xl">Timeline:</Label>
                <span id="timeline"className="flex gap-4">
                    <span className="flex gap-2 items-center">
                        <Label htmlFor="timeline-month" className="text-xl">Month:</Label>
                        <p id="timeline-month">{milestoneData.timelineMonth || "No month set"}</p>
                    </span>
                    <span className="flex gap-2 items-center">
                        <Label htmlFor="timeline-year" className="text-xl">Year:</Label>
                        <p id="timeline-year">{milestoneData.timelineYear || "No year set"}</p>
                    </span>
                </span>
            </div>

            <div className="flex flex-col grow gap-2">
                <Label htmlFor="budget" className="text-xl">Budget:</Label>
                <span className="flex gap-4">
                    <FaDollarSign size={24}/>
                    <p id="budget">{milestoneData.budget || "No budget set"}</p>
                </span>
            </div>

            <div className="flex flex-col grow gap-2">
                <Label htmlFor="papers" className="text-xl">Associated Papers:</Label>
                { milestoneData.papers && milestoneData.papers.length > 0 ?
                    <ol id="papers">
                        {milestoneData.papers.map((paper: string, index: number) => (
                            <li>{`${index + 1}. ${paper}`}</li>
                        ))}
                    </ol> :
                    <p>{"No associated papers"}</p>   
                }
            </div>
        </div>
        </ScrollArea>
    )
}