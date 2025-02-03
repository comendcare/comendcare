import React, { memo, useState } from "react"
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
import { FaArrowRight, FaCalendar, FaEllipsis, FaFileLines, FaPlus, FaTrash } from "react-icons/fa6"
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
import { NodeHandle, PrivateMilestoneNode } from "./private-milestone-node"

export interface TaskType {
    id?: string
    name: string
    status: StatusType
}

function PrivateAssetNode(props: NodeProps<PrivateMilestoneNode>) {
    const handleEditClick = () => {
        props.data?.handleEditClick(props?.id)
    }
    
    const handleDeleteClick = () => {
        props.data?.handleDelete(props?.id)
    }

    const handleDuplicate = () => {
        props.data?.handleDuplicate(props?.id)
    }

    return (
        <Card className={cn("w-[350px]", props.data?.onboardingMilestone ? "research-plan-tour-step2" : "", props.selected ? "border-black border-2" : "")}>
            <CardHeader>
                <div className="h-fit flex flex-row align-center items-center justify-between gap-4">
                    <Badge variant="secondary" className="text-xl rounded-md px-4 py-2 flex gap-2 items-center align-center bg-green-100">
                        <FaFileLines />
                        {"Asset"}
                    </Badge>
                    {props.data?.private && (
                        <PrivateBadge className="justify-start" />
                    )}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                className="p-2 h-auto justify-end h-full"
                            >
                                <FaEllipsis />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40">
                            <Card className="p-0 m-0">
                                <CardContent className="p-2 m-0 flex flex-col gap-0">
                                    <Button 
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handleDeleteClick()
                                        }}
                                        variant="ghost"
                                        className="w-full h-full justify-start text-xl"
                                    >
                                        Delete
                                    </Button>
                                    <Button 
                                        onClick={handleDuplicate}
                                        variant="ghost"
                                        className="w-full h-full justify-start text-xl"
                                    >
                                        Duplicate
                                    </Button>
                                </CardContent>
                            </Card>
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <CardTitle>{props.data?.title || "New Milestone"}</CardTitle>
                    <CardDescription>
                        {truncate(props.data?.description || "", 200)}
                    </CardDescription>
                </div>

                {props.data?.contacts && props.data.contacts.length > 0 ? (
                    <div className={"mt-2 flex items-center gap-x-2.5 text-sm text-gray-400 text-wrap"}>
                        <ul className={cn(props.data.contacts.length > 1 ? "list-disc pl-6": "")}>
                            {props.data.contacts.map((contact, index) => {
                                if (contact.name && contact.email) {
                                    return (
                                        <li key={index}>
                                        <p className="text-wrap break-words">{contact.name} &bull; {contact.email}</p>
                                        </li>
                                    )
                                } else if (contact.name) {
                                    return (
                                        <li key={index}>
                                        <p className="text-wrap break-words">{contact.name}</p>
                                        </li>
                                    )
                                } else if (contact.email) {
                                    return (
                                        <li key={index}>
                                        <p className="text-wrap break-words">{contact.email}</p>
                                        </li>
                                    )
                                }
                            })}
                        </ul>
                    </div>
                ): (
                    <div className="mt-2 flex items-center gap-x-2.5 text-sm text-gray-400">
                        <p>No contacts provided for this asset</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleEditClick}>{`Details`}</Button>
            </CardFooter>

            <NodeHandle type="target" position={Position.Left} node={props as NodeProps<PrivateMilestoneNode>}/>
            <NodeHandle type="source" position={Position.Right} node={props as NodeProps<PrivateMilestoneNode>}/>
        </Card> 
    )
}

export default memo(PrivateAssetNode)
