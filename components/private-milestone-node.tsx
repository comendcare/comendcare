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
import {Button} from "./ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card"
import StatusButton from "./milestone-status-button"
import {truncate, cn, formatMoney} from "@/lib/utils"
import {DateView} from "./miletone-date-view"
import {PrivateBadge} from "./private-badge"
import {badgeVariants} from "./ui/badge"
import {Milestone, StatusType} from "@/lib/types"
import {PopoverClose, PopoverContent, PopoverTrigger} from "@radix-ui/react-popover"
import {Popover} from "./plate-ui/popover"
import {RoadmapState, useRoadmapStore} from "@/state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import {PublicMilestoneNode} from "./public-milestone-node"
import { TypeBadge } from "./type-badge"
import { MilestoneType } from "@prisma/client"
import { MilestoneTypeBadge } from "./milestone-type-badge"
import { Calendar, CircleDollarSign, Ellipsis, ExternalLink, Megaphone, Plus, Star, Trash, User } from "lucide-react"
import { Tool as DBAsset, RFP as DBRFP } from "@prisma/client"
import { PropertyBadge } from "./property-badge"
import { ProjectActionsMenu } from "./project-actions-menu"

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
    }), [selectedNodeIds]

    return (
        <Card 
            className={cn(
                "w-[350px] text-wrap break-words",
                props?.id && selectedNodeIds.includes(props?.id) ? "border-black border-2 click-project-step" : "",
                props.id === "preview" ? "opacity-50" : "",
            )}
        >
            <CardHeader>
                <div className="flex flex-row align-center items-center justify-end gap-4">
                    <ProjectActionsMenu milestone={props.data as Milestone}/>
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

export const CardContents = ({props}: { props: NodeProps<PrivateMilestoneNode | PublicMilestoneNode> }) => {
    // if (props?.type === "ASSET") {
    //     return (
    //         <>
    //             <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
    //                 {props.data?.contacts && props.data.contacts.length > 0 && (props.data?.contacts || []).map((contact, index) => {
    //                     if (contact.name && contact.email) {
    //                         return (
    //                             <li key={index} className="flex gap-2 items-center">
    //                                 <User />
    //                                 <p className="w-[90%] text-wrap break-words">{contact.name} &bull; {contact.email}</p>
    //                             </li>)
    //                     } else if (contact.name) {
    //                         return (
    //                             <li key={index} className="flex gap-2 items-center w-full">
    //                                 <User />
    //                                 <p className="w-[90%] text-wrap break-words">{contact.name}</p>
    //                             </li>)
    //                     } else if (contact.email) {
    //                         return (
    //                             <li key={index} className="flex gap-2 items-center">
    //                                 <User />
    //                                 <p className="w-[90%] text-wrap break-words">{contact.email}</p>
    //                             </li>)
    //                     }
    //                 })}
    //             </ul>

    //             <span className="w-full flex gap-2 flex-wrap text-wrap">
    //                 {props?.data?.attachments && props.data?.attachments?.length > 0 && (
    //                     <AttachmentsTag attachments={props.data.attachments}/>
    //                 )}
    //                 {(props?.data?.types || []).sort((a, b) => a?.milestoneType?.label.length - b?.milestoneType?.label.length).map((milestoneType, index) => (
    //                     <MilestoneTypeBadge label={milestoneType?.milestoneType?.label} key={index} />
    //                 ))}
    //             </span>
    //         </>
    //     )

    //     return
    // }

    // if (props?.type === "PROJECT") {
        return (
            <>
                <ul className="w-full flex flex-col gap-2 text-sm text-wrap break-words">
                    {(props.data?.contacts || []).map((contact, index) => {
                        if (contact.affiliation) {
                            return (
                                <li key={index}>
                                    <PropertyBadge icon={User}>
                                        <p className="w-[90%] text-wrap break-words">{contact.affiliation}</p>
                                    </PropertyBadge>
                                </li>
                            )
                        }
                    })}

                    {(props?.data?.startDate || props?.data?.endDate) && (
                        <li>
                            <PropertyBadge icon={Calendar}>
                                <DateView startDate={props.data?.startDate || undefined} endDate={props.data?.endDate || undefined}/>
                            </PropertyBadge>
                        </li>
                    )}
                    {(props.data?.tools || []).map((tool, index) => (
                        <li key={index}>
                            <PropertyBadge icon={Star}>
                                <p>{tool.tool?.title}</p>
                            </PropertyBadge>
                        </li>
                    ))}
                    {(props.data?.rfps || []).map((rfp, index) => (
                        <li key={index}>
                            <PropertyBadge icon={Megaphone}>
                                <p>{rfp.rfp?.title}</p>
                            </PropertyBadge>
                        </li>
                    ))}
                </ul>
                <span className="w-full flex gap-2 flex-wrap">
                    <StatusButton
                        disabled={true}
                        status={props.data.status as StatusType || undefined}
                        onStatusChange={() => {}}
                    />
                    {(props?.data?.types || []).sort((a, b) => (a?.milestoneType?.label?.length || 0) - (b?.milestoneType?.label?.length || 0)).map((milestoneType, index) => (
                        <MilestoneTypeBadge key={index} label={milestoneType?.milestoneType?.label} />
                    ))}
                </span>
            </>

        )
    // }

    // if (props?.type === "RFP") {
    //     return (
    //         <>
    //             <ul className="flex flex-col gap-2 text-sm">
    //                 {(props?.data?.startDate || props?.data?.endDate) && (
    //                     <li>
    //                         <DateView startDate={props.data?.startDate} endDate={props.data?.endDate}
    //                                   startLabel={"Request Opens:"} endLabel={"Deadline for Proposals:"}/>
    //                     </li>
    //                 )}
    //                 {props?.data?.budget && (
    //                     <li className="flex gap-2 items-center">
    //                         <CircleDollarSign />
    //                         {formatMoney(props?.data?.budget)} budget
    //                     </li>
    //                 )}
    //             </ul>

    //             <span className="w-full flex gap-2 flex-wrap text-wrap">
    //                 {(props?.data?.types || []).sort((a, b) => a?.milestoneType?.label.length - b?.milestoneType?.label.length).map((milestoneType, index) => (
    //                     <MilestoneTypeBadge key={index} label={milestoneType?.milestoneType?.label} />
    //                 ))}
    //         </span>
    //         </>
    //     )
    // }

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
            <ExternalLink className="h-4 w-4"/>
            {attachments.length > 1 ? `${attachments.length} Links` : `${attachments.length} Link`}
        </div>
    )
}

export default memo(PrivateMilestoneNode)
