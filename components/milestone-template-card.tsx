import React, { memo, SetStateAction, useState } from "react"
import { Handle, Position, Node, NodeProps, HandleProps, getIncomers, getOutgoers, getConnectedEdges } from "@xyflow/react"
import { Button } from "./ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card"
import { FaArrowRight, FaCalendar, FaEllipsis, FaPlus, FaTrash } from "react-icons/fa6"
import StatusButton from "./milestone-status-button"
import { truncate, cn } from "@/lib/utils"
import { DateView } from "./miletone-date-view"
import { PrivateBadge } from "./private-badge"
import {monthsList} from "@/lib/data";
import { Badge } from "./ui/badge"
import { MILESTONE_TYPE_OPTIONS, NODE_TYPE_OPTIONS, StatusType } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { Popover } from "./plate-ui/popover"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { CheckBubble } from "./check-bubble"

export function MilestoneTemplateCard({ milestoneData, selectedMilestones, setSelectedMilestones }: {milestoneData: any, selectedMilestones: any[], setSelectedMilestones: (value: SetStateAction<any[]>) => void}) {
    return (
        <Card className="relative bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible">
            <CardHeader>
                <CheckBubble data={milestoneData} onCheckedChanged={
                    (checked: boolean) => {
                        if (checked) {
                            setSelectedMilestones([...selectedMilestones, milestoneData])
                        } else {
                            setSelectedMilestones(selectedMilestones.filter(m => (
                                m.title !== milestoneData.title &&
                                m.description !== milestoneData.description
                            )))
                        }
                    }
                }/>
                <Badge variant="secondary" className="w-fit px-4 py-2 flex text-sm">
                    <p className="text-lg">{NODE_TYPE_OPTIONS.find((option) => (option.value === milestoneData?.nodeType))?.label || "Unknown"}</p>
                </Badge>
                <CardTitle>{milestoneData.title}</CardTitle>
                <CardDescription>
                    {milestoneData.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8 overflow-visible">
                {/* <ul className="flex flex-col gap-2">
                    {milestoneData.tasks?.map((task: Task, index) => (
                        <li key={index} className="flex flex-row gap-2 items-center">
                            <FaCheck size={20} className="h-4 w-4 text-green-500"/>
                            <p className="grow">{task.name}</p>
                        </li>
                    ))}
                </ul> */}
            </CardContent>
        </Card>
    )
}