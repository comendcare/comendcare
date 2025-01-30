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
import { FaArrowRight, FaBullhorn, FaCalendar, FaDollarSign, FaEllipsis, FaFileLines, FaPlus, FaStar, FaTrash, FaUser } from "react-icons/fa6"
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
import { PublicMilestoneNode } from "./public-milestone-node"

export type PrivateMilestoneNode = Node<
    {
        nodeType: string
        nodeId: string
        node: any
        title: string
        description?: string
        type?: string,
        startDate?: Date,
        endDate?: Date,
        budget?: number
        attachments?: string[]
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
        private: boolean,
        contacts: any[]
    },
    "PROJECT" | "ASSET" | "RFP"
>

export interface TaskType {
    id?: string
    name: string
    status: StatusType
}

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
                <div className="h-fit flex flex-row align-center items-center justify-between gap-4">
                    <TypeBadge type={props.type}/>
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
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <CardTitle>{props.data?.title || "New Milestone"}</CardTitle>
                    <CardDescription>
                        {truncate(props.data?.description || "", 200)}
                    </CardDescription>
                </div>

                <CardContents props={props}/>
            </CardContent>
            <CardFooter className="flex justify-end">
                {props.data?.private && (
                    <PrivateBadge className="justify-start" />
                )}
                <Button onClick={handleEditClick} className="ml-auto">{`Details`}</Button>
            </CardFooter>

            <NodeHandle type="target" position={Position.Left} node={props as NodeProps<PrivateMilestoneNode>}/>
            <NodeHandle type="source" position={Position.Right} node={props as NodeProps<PrivateMilestoneNode>}/>
        </Card> 
    )
}

const selector = (state: RoadmapState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onEdgesChange: state.onEdgesChange,
})

export const NodeHandle = (props: HandleProps & { node: NodeProps<PrivateMilestoneNode> }) => {
    const [isHovering, setIsHovering] = useState(false)
    const {
        nodes,
        edges,
        onEdgesChange,
    } = useRoadmapStore(useShallow(selector))

    const handleTrashClick = async (event: React.MouseEvent) => {
        event.stopPropagation()
        let nodesToDelete: any[] = [{ id: props.node.id }]

        if (props.type === 'target') {
            nodesToDelete = nodesToDelete.concat(getIncomers({ id: props.node.id }, nodes, edges))
        }

        if (props.type === 'source') {
            nodesToDelete = nodesToDelete.concat(getOutgoers({ id: props.node.id }, nodes, edges))
        }

        const edgesToDelete = await getConnectedEdges(nodesToDelete, edges)

        await onEdgesChange(edgesToDelete
            .filter(edge => {
                if (props.type === "source") {
                    return edge.source === props.node.id
                }

                if (props.type === "target") {
                    return edge.target === props.node.id
                }

                return false
            })
            .map(edge => ({
                id: edge.id,
                type: 'remove'
        })))
    }

    return (
        <Handle
            type={props.type}
            position={props.position}
            onMouseOver={() => setIsHovering(true)}
            onMouseOut={() => setIsHovering(false)}
            className={cn(
                "research-plan-tour-step5 z-10 bg-white transition-all rounded-full border-solid border-black border-2",
                isHovering ? "p-1 flex flex-col gap-1" : ""
            )}
        >
            <Button 
                variant="ghost" 
                className="hover:bg-secondary h-8 w-8 rounded-full pointer-events-none"
            >
                <FaPlus className="pointer-events-none" />
            </Button>
            {isHovering && (
                <Button 
                    variant="ghost" 
                    className="h-8 w-8 rounded-full hover:bg-white" 
                    onClick={handleTrashClick}
                >
                    <FaTrash />
                </Button>
            )}
        </Handle>
    )
}

export const TypeBadge = ({type}: {type: "PROJECT" | "ASSET" | "RFP"}) => {
    if (type === "ASSET") {
        return (
            <Badge variant="outline" className="h-8 text-sm flex gap-2 border-green-500 text-green-800">
                <FaStar />
                {"Asset"}
            </Badge>
        )
    }
    
    if (type === "PROJECT") {
        return (
            <Badge variant="outline" className="h-8 text-sm flex gap-2 border-yellow-500 text-yellow-800">
                <FaFileLines />
                {"Project"}
            </Badge>
        )
    }

    if (type === "RFP") {
        return (
            <Badge variant="outline" className="h-8 text-sm flex gap-2 border-red-500 text-red-800">
                <FaBullhorn />
                {"RFP (Request for Proposal)"}
            </Badge>
        )
    }

    return
}

export const CardContents = ({props}: {props: NodeProps<PrivateMilestoneNode | PublicMilestoneNode>}) => {
    if (props?.type === "PROJECT") {
        return (
            <>  
            <ul className="flex flex-col gap-2 text-sm">
                {(props.data?.startDate && props.data?.endDate && props.data.startDate?.getMonth() || props.data?.endDate?.getFullYear()) && (
                    <DateView startDate={props.data?.startDate} endDate={props.data?.endDate}/>
                )}
                {/* {props.data.contacts.map((contact, index) => {
                    if (contact.name && contact.email) {
                        return (
                            <li key={index} className="flex gap-2 items-center break-words">
                                <FaUser />
                                {contact.name} &bull; {contact.email}
                            </li>)
                    } else if (contact.name) {
                        return (
                            <li key={index} className="flex gap-2 items-center break-words">
                                <FaUser />
                                {contact.name}
                            </li>)
                    } else if (contact.email) {
                        return (
                            <li key={index} className="flex gap-2 items-center break-words">
                                <FaUser />
                                {contact.email}
                            </li>)
                    }
                })} */}
            </ul>
            <span className="w-full flex gap-2 flex-wrap">
                <Badge className="flex text-sm">
                    {MILESTONE_TYPE_OPTIONS.find((option) => (option.value === props.data?.type))?.label || "No type"}
                </Badge>
                <StatusButton
                    className="rounded-full h-8"
                    disabled={true}
                    status={props.data.status}
                    onStatusChange={() => {}}
                />
            </span>
            </>

        )
    }

    if (props?.type === "ASSET") {
        if (props.data?.contacts && props.data.contacts.length > 0) {
            return (
                <ul className="flex flex-col gap-2 text-sm">
                    {(props.data?.contacts || []).map((contact, index) => {
                        if (contact.name && contact.email) {
                            return (
                                <li key={index} className="flex gap-2 items-center break-words">
                                    <FaUser />
                                    {contact.name} &bull; {contact.email}
                                </li>)
                        } else if (contact.name) {
                            return (
                                <li key={index} className="flex gap-2 items-center break-words">
                                    <FaUser />
                                    {contact.name}
                                </li>)
                        } else if (contact.email) {
                            return (
                                <li key={index} className="flex gap-2 items-center break-words">
                                    <FaUser />
                                    {contact.email}
                                </li>)
                        }
                    })}
                </ul>
            )
        }

        return
    }

    if (props?.type === "RFP") {
        return (
            <ul className="flex flex-col gap-2 text-sm">
                {props?.data?.startDate && (
                    <li className="flex gap-2 items-center">
                        <FaCalendar />
                        <p>{props?.data.startDate.toDateString()}</p>
                    </li>
                )}
                {props?.data?.budget && (
                    <li className="flex gap-2 items-center">
                        <FaDollarSign />
                        <p>{`${props?.data.budget.toLocaleString()} USD`}</p>
                    </li>
                )}
                {(props.data?.contacts || []).map((contact, index) => {
                    if (contact.name && contact.email) {
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <FaUser />
                                {contact.name} &bull; {contact.email}
                            </li>)
                    } else if (contact.name) {
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <FaUser />
                                {contact.name}
                            </li>)
                    } else if (contact.email) {
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <FaUser />
                                {contact.email}
                            </li>)
                    }
                })}
            </ul>
        )
    }

    return (
        <div>error</div>
    )
}

export default memo(PrivateMilestoneNode)
