import React, { memo, SetStateAction, useEffect, useState } from "react"
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
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        if (isChecked) {
            setSelectedMilestones([...selectedMilestones, milestoneData])
        } else {
            setSelectedMilestones(selectedMilestones.filter(m => (
                m.title !== milestoneData.title &&
                m.description !== milestoneData.description
            )))
        }
    }, [isChecked])
    
    return (
        <button onClick={() => {setIsChecked(prev => !prev)}}>
            <Card className="relative bg-white shadow-sm rounded-lg overflow-hidden text-left overflow-visible hover:bg-secondary cursor-pointer">
                <CardHeader>
                    <CheckBubble isChecked={isChecked} onCheckedChanged={(event: any) => setIsChecked(event.value)}/>
                    {/* <TypeBadge className="w-fit" type={NODE_TYPE_OPTIONS.find((option) => (option.value === milestoneData?.nodeType))?.value || "PROJECT"}/> */}
                </CardHeader>
                <CardContent className="flex flex-col gap-2 overflow-visible">
                    <CardTitle>{milestoneData.title}</CardTitle>
                    <CardDescription>
                        {milestoneData.description}
                    </CardDescription>
                </CardContent>
            </Card>
        </button>
    )
}