import React, { memo } from "react"
import { Handle, Position, Node, NodeProps } from "@xyflow/react"
import { Button } from "./ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card"
import { FaArrowRight, FaCalendar, FaEllipsis, FaPlus } from "react-icons/fa6"
import StatusButton from "./milestone-status-button"
import { truncate, cn } from "@/lib/utils"
import { DateView } from "./miletone-date-view"
import { PrivateBadge } from "./private-badge"
import {monthsList} from "@/lib/data";
import { Badge } from "./ui/badge"
import { MILESTONE_TYPE_OPTIONS } from "@/lib/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { Popover } from "./plate-ui/popover"

export type PrivateMilestoneNode = Node<
    {
        nodeId: string
        title: string
        description?: string
        type?: string,
        startDate?: Date,
        endDate?: Date,
        budget?: number
        papers?: string[]
        stakeholders?: string[]
        labels?: string[]
        // tasks: TaskType[],
        dependencies?: string[]
        notes?: string
        status: StatusType
        handleEditClick: (nodeId: string) => void,
        handleDelete: (nodeId: string) => void,
        handleDuplicate: (nodeId: string) => void,
        onboardingMilestone: boolean,
        private: boolean
    },
    "MILESTONE"
>

export interface TaskType {
    id?: string
    name: string
    status: StatusType
}

type StatusType = "PLANNED" | "INPROGRESS" | "COMPLETED"

function PrivateMilestoneNode(props: NodeProps<PrivateMilestoneNode>) {
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
                <div className="-mt-4 -mr-4 h-fit flex flex-row align-center justify-end gap-4">
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
                <CardTitle>{props.data?.title || "New Milestone"}</CardTitle>
                {/* Description length in node is truncated to 200 characters. */}
                <CardDescription>
                    {truncate(props.data?.description || "", 200)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
                <span className="w-full flex">
                    <Badge className="flex text-sm">
                        {MILESTONE_TYPE_OPTIONS.find((option) => (option.value === props.data?.type))?.label || "No type"}
                    </Badge>
                </span>
                
                {(props.data?.startDate && props.data?.endDate && props.data.startDate?.getMonth() || props.data?.endDate?.getFullYear()) && (
                    <DateView startDate={props.data?.startDate} endDate={props.data?.endDate}/>
                )}

                {/* Related Ticket: https://www.notion.so/comend/Milestone-Tasks-122801a6fddc80c69584f329f57f82fd?pvs=4 */}
                {/* {props.data?.labels && props.data?.labels.length > 0 && 
                <span className='flex gap-2 items-center'>
                    <FaTag size={24}/>
                    <p>{props.data.labels.join(', ')}</p>
                </span>
                } */}

                {/* Related Ticket: https://www.notion.so/comend/Milestone-Labels-122801a6fddc80e69136e4e7ca9445b9?pvs=4 */}
                {/* <ul className="flex flex-col gap-2"> 
                {props.data?.tasks?.map((task, index) => (
                    <li key={index} className="flex flex-row gap-2 items-center">
                        <TaskStatusButton complete={task.complete} onClick={() => {}} />
                        <p>{task.name}</p>
                    </li>
                ))}
            </ul> */}
            </CardContent>
            <CardFooter className="flex justify-between">
                <StatusButton
                    disabled={true}
                    status={props.data.status}
                    onStatusChange={() => {}}
                />
                <Button onClick={handleEditClick}>{`Details`}</Button>
            </CardFooter>

            <Handle
                type="target"
                position={Position.Left}
                className="z-10 bg-white p-1 transition-all hover:p-2 rounded-full border-solid border-black border-2"
            >
                <FaPlus className="pointer-events-none" />
            </Handle>
            <Handle
                type="source"
                position={Position.Right}
                className={cn("z-10 bg-white p-1 transition-all hover:p-2 rounded-full border-solid border-black border-2", props.data?.onboardingMilestone ? "research-plan-tour-step5": "")}
            >
                <FaPlus className="pointer-events-none" />
            </Handle>
        </Card>
    )
}

export default memo(PrivateMilestoneNode)
