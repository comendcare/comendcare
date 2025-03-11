import React, {memo, useState} from "react"
import {
    Handle,
    Position,
    Node,
    NodeProps,
    HandleProps,
    getIncomers,
    getOutgoers,
    getConnectedEdges
} from "@xyflow/react"
import {Button} from "./ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card"
import {
    FaArrowRight,
    FaArrowUpRightFromSquare,
    FaBullhorn,
    FaCalendar,
    FaDollarSign,
    FaEllipsis,
    FaFileLines,
    FaPaperclip,
    FaPlus,
    FaStar,
    FaTrash,
    FaUser
} from "react-icons/fa6"
import StatusButton from "./milestone-status-button"
import {truncate, cn, formatMoney} from "@/lib/utils"
import {DateView} from "./miletone-date-view"
import {PrivateBadge} from "./private-badge"
import {monthsList} from "@/lib/data";
import {Badge, badgeVariants} from "./ui/badge"
import {StatusType} from "@/lib/types"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "./ui/dropdown-menu"
import {PopoverClose, PopoverContent, PopoverTrigger} from "@radix-ui/react-popover"
import {Popover} from "./plate-ui/popover"
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import {PublicMilestoneNode} from "./public-milestone-node"
import { TypeBadge } from "./type-badge"
import { MilestoneType } from "@prisma/client"
// import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export type PrivateMilestoneNode = Node<
    {
        nodeType: string
        nodeId: string
        node: any
        title: string
        description?: string
        types?: MilestoneType[],
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

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    nodes: state.nodes,
    edges: state.edges,
    onEdgesChange: state.onEdgesChange,
})

function PrivateMilestoneNode(props: NodeProps<PrivateMilestoneNode>) {
    const {
        selectedNodeId,
    } = useRoadmapStore(useShallow(selector))

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
        <Card className={cn(
            "w-[350px] text-wrap break-words",
            props.data?.onboardingMilestone ? "research-plan-tour-step2" : "",
            selectedNodeId === props?.id ? "border-black border-2" : "",
            props.id === "preview" ? "opacity-50" : ""
        )}>
            <CardHeader>
                <div className="h-fit flex flex-row align-center items-center justify-between gap-4">
                    <TypeBadge type={props.type}/>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                onClick={(e) => e.stopPropagation()}
                                variant="ghost"
                                className="p-2 h-auto justify-end h-full z-20"
                            >
                                <FaEllipsis/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40 z-20">
                            <Card className="p-0 m-0">
                                <CardContent className="p-2 m-0 flex flex-col gap-0">
                                    <PopoverClose>
                                        <Button
                                            onClick={(e) => {
                                                // e.stopPropagation()
                                                handleEditClick()
                                            }}
                                            variant="ghost"
                                            className="w-full h-full justify-start text-xl"
                                        >
                                            Edit
                                        </Button>
                                    </PopoverClose>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteClick()
                                        }}
                                        variant="ghost"
                                        className="w-full h-full justify-start text-xl"
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDuplicate()
                                        }}
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
                    <CardDescription className="line-clamp-2">
                        {truncate(props.data?.description || "", 200)}
                    </CardDescription>
                </div>

                <CardContents props={props}/>
            </CardContent>
            {props.data?.private && (
                <CardFooter className="flex justify-end">
                    <PrivateBadge className="justify-start"/>
                </CardFooter>
            )}

            {props.id !== "preview" && (
                <>
                    <NodeHandle type="target" position={Position.Left} node={props as NodeProps<PrivateMilestoneNode>}/>
                    <NodeHandle className={cn(props.data?.onboardingMilestone ? "research-plan-tour-step5" : "")}
                                type="source" position={Position.Right}
                                node={props as NodeProps<PrivateMilestoneNode>}/>
                </>
            )}
        </Card>
    )
}

export const NodeHandle = (props: HandleProps & { node: NodeProps<PrivateMilestoneNode> }) => {
    const [isHovering, setIsHovering] = useState(false)
    const {
        nodes,
        edges,
        onEdgesChange,
    } = useRoadmapStore(useShallow(selector))

    const handleTrashClick = async (event: React.MouseEvent) => {
        event.stopPropagation()
        let nodesToDelete: any[] = [{id: props.node.id}]

        if (props.type === 'target') {
            nodesToDelete = nodesToDelete.concat(getIncomers({id: props.node.id}, nodes, edges))
        }

        if (props.type === 'source') {
            nodesToDelete = nodesToDelete.concat(getOutgoers({id: props.node.id}, nodes, edges))
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
                "z-10 bg-white transition-all rounded-full border-solid border-black border-2",
                isHovering ? "p-1 flex flex-col gap-1" : "",
                props.className
            )}
            onClick={(e) => e.stopPropagation()}
        >
            <Button
                variant="ghost"
                className="hover:bg-secondary h-8 w-8 rounded-full pointer-events-none"
            >
                <FaPlus className="pointer-events-none"/>
            </Button>
            {isHovering && (
                <Button
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-white"
                    onClick={handleTrashClick}
                >
                    <FaTrash/>
                </Button>
            )}
        </Handle>
    )
}

export const CardContents = ({props}: { props: NodeProps<PrivateMilestoneNode | PublicMilestoneNode> }) => {
    if (props?.type === "ASSET") {
        return (
            <>
                <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
                    {props.data?.contacts && props.data.contacts.length > 0 && (props.data?.contacts || []).map((contact, index) => {
                        if (contact.name && contact.email) {
                            return (
                                <li key={index} className="flex gap-2 items-center">
                                    <FaUser/>
                                    <p className="w-[90%] text-wrap break-words">{contact.name} &bull; {contact.email}</p>
                                </li>)
                        } else if (contact.name) {
                            return (
                                <li key={index} className="flex gap-2 items-center w-full">
                                    <FaUser/>
                                    <p className="w-[90%] text-wrap break-words">{contact.name}</p>
                                </li>)
                        } else if (contact.email) {
                            return (
                                <li key={index} className="flex gap-2 items-center">
                                    <FaUser/>
                                    <p className="w-[90%] text-wrap break-words">{contact.email}</p>
                                </li>)
                        }
                    })}
                </ul>

                <span className="w-full flex gap-2 flex-wrap text-wrap">
                    {props?.data?.attachments && props.data?.attachments?.length > 0 && (
                        <AttachmentsTag attachments={props.data.attachments}/>
                    )}
                    {(props?.data?.types || []).sort((a, b) => a.label.length - b.label.length).map((milestoneType, index) => (
                        <Badge variant="secondary" className="text-sm h-7 rounded-md px-2 py-1 font-medium" key={index}>
                            {milestoneType?.label || "No type"}
                        </Badge>
                    ))}
                </span>
            </>
        )

        return
    }

    if (props?.type === "PROJECT") {
        return (
            <>
                <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
                    {(props.data?.contacts || []).map((contact, index) => {
                        if (contact.affiliation) {
                            return (
                                <li key={index} className="flex gap-2 items-center">
                                    <FaUser/>
                                    <p className="w-[90%] text-wrap break-words">{contact.affiliation}</p>
                                </li>
                            )
                        }
                    })}

                    {(props?.data?.startDate || props?.data?.endDate) && (
                        <li>
                            <DateView startDate={props.data?.startDate} endDate={props.data?.endDate}/>
                        </li>
                    )}
                </ul>
                <span className="w-full flex gap-2 flex-wrap text-wrap">
                    <StatusButton
                        className="text-sm h-7 w-min rounded-md px-2 py-1 font-medium"
                        disabled={true}
                        status={props.data.status}
                        onStatusChange={() => {
                        }}
                    />
                    {(props?.data?.types || []).sort((a, b) => a.label.length - b.label.length).map((milestoneType, index) => (
                        <Badge variant="secondary" className="text-sm h-7 rounded-md px-2 py-1 font-medium" key={index}>
                            {milestoneType?.label || "No type"}
                        </Badge>
                    ))}
            </span>
            </>

        )
    }

    if (props?.type === "RFP") {
        return (
            <>
                <ul className="flex flex-col gap-2 text-sm">
                    {(props?.data?.startDate || props?.data?.endDate) && (
                        <li>
                            <DateView startDate={props.data?.startDate} endDate={props.data?.endDate}
                                      startLabel={"Request Opens:"} endLabel={"Deadline for Proposals:"}/>
                        </li>
                    )}
                    {props?.data?.budget && (
                        <li className="flex gap-2 items-center">
                            <FaDollarSign/>
                            {formatMoney(props?.data?.budget)} budget
                        </li>
                    )}
                </ul>

                <span className="w-full flex gap-2 flex-wrap text-wrap">
                    {(props?.data?.types || []).sort((a, b) => a.label.length - b.label.length).map((milestoneType, index) => (
                        <Badge variant="secondary" className="text-sm h-7 rounded-md px-2 py-1 font-medium" key={index}>
                            {milestoneType?.label || "No type"}
                        </Badge>
                    ))}
            </span>
            </>
        )
    }

    return (
        <div>error</div>
    )
}

export const AttachmentsTag = ({attachments}: { attachments: any[] }) => {
    return (
        <div
            className={cn(
                badgeVariants({variant: "secondary"}),
                "text-sm w-min inline-flex flex-row justify-start items-center gap-x-2 truncate rounded-md px-2 py-1 font-medium"
            )}
        >
            <FaArrowUpRightFromSquare/>
            {attachments.length > 1 ? `${attachments.length} Links` : `${attachments.length} Link`}
        </div>
    )
}

export default memo(PrivateMilestoneNode)
