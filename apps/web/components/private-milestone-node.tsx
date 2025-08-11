import React, {memo, useEffect, useState} from "react"
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
import {Button} from "@comend/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@comend/components/ui/card"
import StatusButton from "./milestone-status-button"
import {truncate, cn, formatMoney} from "@comend/lib/utils"
import {DateView} from "./miletone-date-view"
import {PrivateBadge} from "./private-badge"
import {Badge, badgeVariants} from "@comend/components/ui/badge"
import {Milestone, StatusType} from "@comend/lib/types"
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import {PublicMilestoneNode} from "./public-milestone-node"
import { MilestoneTypeBadge } from "@comend/components/milestone-type-badge"
import { Box, Calendar, ExternalLink, Megaphone, Microscope, Plus, Trash, User } from "lucide-react"
import { PropertyBadge } from "./property-badge"
import { ProjectActionsMenu } from "./project-actions-menu"
import { Separator } from "@/packages/components/ui/separator"

export type PrivateMilestoneNode = Node<
    Milestone & {
        contextMenuRef: React.RefObject<HTMLDivElement>, 
    },
    "PROJECT" | "ASSET" | "RFP"
>

export interface TaskType {
    id?: string
    name: string
    status: StatusType
}

const selector = (state: RoadmapState) => ({
    selectedNodeIds: state.selectedNodeIds,
    nodes: state.nodes,
    edges: state.edges,
    onEdgesChange: state.onEdgesChange,
    setSelectedNodeIds: state.setSelectedNodeIds,
})

function PrivateMilestoneNode(props: NodeProps<PrivateMilestoneNode>) {
    const {selectedNodeIds, setSelectedNodeIds} = useRoadmapStore(useShallow(selector))

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const target = event.target as any;

        // Check if click was inside context menu
        if (props.data.contextMenuRef.current?.contains(target)) return
        if (props.data.contextMenuRef.current?.contains(target) || target.closest('[data-skip-outside-click]') || (event instanceof MouseEvent && event.button === 2)) {
            return
        }
        // Skip right clicks
        if (event instanceof MouseEvent && event.button === 2) return
        // skip if user had meta (ctrl/cmd), ctrl, or alt key held down
        if (event.metaKey || event.ctrlKey || event.altKey) return

        if (selectedNodeIds.length > 1 && props.id && selectedNodeIds.includes(props.id)) {
            setSelectedNodeIds([])
        }
    }

    useEffect(() => {
        if (selectedNodeIds.length > 1) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchend', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchend', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchend', handleClickOutside);
        };
    }, [selectedNodeIds])

    return (
        <Card 
            className={cn(
                "border-2 border-blue-300 bg-blue-50 w-[350px] text-wrap",
                props?.id && selectedNodeIds.includes(props?.id) ? "border-blue-900 border-2 click-project-step" : "",
                props.id === "preview" ? "opacity-50" : "",
            )}
        >
            <CardHeader className="py-4">
                <div className="absolute top-0 right-0 p-2">
                    <ProjectActionsMenu milestone={props.data as Milestone}/>
                </div>
                <CardTitle className="text-blue-900">
                    {props.data?.title || "New Milestone"}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                    {truncate(props.data?.description || "", 200)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <StatusButton 
                    status={props.data?.status as StatusType || undefined}
                    minimal={true}
                    disabled={true}
                    onStatusChange={() => {}}
                />

                {(props?.data?.types || []).sort((a, b) => a?.milestoneType?.label && b?.milestoneType?.label ? a?.milestoneType?.label.length - b?.milestoneType?.label.length : 0).map((milestoneType, index) => (
                    <Badge variant={"blue"} className="w-fit">
                        {milestoneType?.milestoneType?.label || "No type"}
                    </Badge>
                ))}

                <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
                    {(props.data?.contacts || []).map((contact, index) => {
                        if (contact.affiliation) {
                            return (
                                <li key={index}>
                                    <PropertyBadge icon={User} className="border-blue-300 text-blue-900">
                                        <p className="w-[90%] text-wrap break-words">{contact.affiliation}</p>
                                    </PropertyBadge>
                                </li>
                            )
                        }
                    })}

                    {(props?.data?.startDate || props?.data?.endDate) && (
                        <li>
                            <PropertyBadge icon={Calendar} className="border-blue-300 text-blue-900">
                                <DateView startDate={props.data?.startDate || undefined} endDate={props.data?.endDate || undefined}/>
                            </PropertyBadge>
                        </li>
                    )}
                </ul>

                {(props.data?.tools?.length > 0 || props.data?.rfps?.length > 0) && (
                    <>
                    <Separator className="mt-4 bg-blue-300 h-[2px] rounded-full"/>
                    <span className="text-blue-900 text-md flex gap-1">
                        <Box />
                        <p className="text-md font-semibold text-blue-900">Linked Items:</p>
                    </span>
                    <ul>
                        {props.data?.tools.map(({tool}) => (
                            <Card
                                className={cn(
                                    "border-2 border-emerald-200 bg-emerald-50 w-full text-wrap break-words rounded-sm",
                                )}
                            >
                                <CardHeader className="p-4">
                                    <CardTitle className="text-emerald-900 text-md">{tool?.title || "untitled tool"}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {truncate(tool?.description || "", 200)}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </ul>
                    <ul>
                        {props.data?.rfps.map(({rfp}) => (
                            <Card
                                className={cn(
                                    "border-2 border-violet-200 bg-violet-50 w-full text-wrap break-words rounded-sm",
                                )}
                            >
                                <CardHeader className="p-4">
                                    <CardTitle className="text-violet-900 text-md">{rfp?.title || "untitled RFP"}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {truncate(rfp?.description || "", 200)}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </ul>
                    </>
                )}
            </CardContent>
            {props.data?.private && (
                <CardFooter className="flex justify-end">
                    <PrivateBadge className="justify-start"/>
                </CardFooter>
            )}

            {props.id !== "preview" && (
                <>
                    <NodeHandle type="target" position={Position.Left} node={props as NodeProps<PrivateMilestoneNode>}/>
                    <NodeHandle 
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
                <Plus className="pointer-events-none"/>
            </Button>
            {isHovering && (
                <Button
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-white"
                    onClick={handleTrashClick}
                >
                    <Trash />
                </Button>
            )}
        </Handle>
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
            <ExternalLink className="h-4 w-4"/>
            {attachments.length > 1 ? `${attachments.length} Links` : `${attachments.length} Link`}
        </div>
    )
}

export default memo(PrivateMilestoneNode)
