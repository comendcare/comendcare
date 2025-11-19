import React, {memo, useEffect, useRef, useState} from "react"
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
import {BIOSAMPLE_TYPE_OPTIONS, DISEASE_MODEL_TYPE_OPTIONS, Milestone, StatusType} from "@comend/lib/types"
import {RoadmapState, useRoadmapStore} from "./../state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
// import {PublicMilestoneNode} from "./public-milestone-node"
import { MilestoneTypeBadge } from "@comend/components/milestone-type-badge"
import { Box, Calendar, ExternalLink, Megaphone, Microscope, Plus, Trash, User, Lock, BadgeAlert, DollarSign, TestTubeDiagonal, Rat, Database, Globe } from "lucide-react"
import { ProjectActionsMenu } from "./project-actions-menu"
import { Separator } from "@/packages/components/ui/separator"
import { Tooltip, TooltipContent } from "@/packages/components/ui/tooltip"
import { TooltipTrigger } from "@/packages/components/plate-ui/tooltip"
import { Organization } from "@prisma/client"
import { PublicPrivateButton } from "./public-private-button"

export type MilestoneNodeType = Node<
    Milestone & {
        contextMenuRef?: React.RefObject<HTMLDivElement>, 
        focused?: boolean
        subdomain?: string | undefined,
        externalLink?: boolean,
        organization?: Organization,
        isPublic?: boolean,
        setUrlMilestone?: (id: string) => void | undefined,
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
    setMilestone: state.setMilestone
})

export function MilestoneNode(props: NodeProps<MilestoneNodeType>) {
    const {selectedNodeIds, setSelectedNodeIds, setMilestone} = useRoadmapStore(useShallow(selector))

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const target = event.target as any;

        // Check if click was inside context menu
        if (props.data.contextMenuRef?.current?.contains(target)) return
        if (props.data.contextMenuRef?.current?.contains(target) || target.closest('[data-skip-outside-click]') || (event instanceof MouseEvent && event.button === 2)) {
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

    const handleEditClick = (event: React.MouseEvent, nodeId: string) => {
        if (event.ctrlKey || event.altKey) return
        if (event.metaKey) {
            // if CMD (on mac) or CTRL (on windows) is held, add id to multiselect
            if (nodeId && !selectedNodeIds.includes(nodeId)) {
                setSelectedNodeIds([...selectedNodeIds, nodeId])
            }
        } else {
            // regular click, set selected node id
            if (nodeId) {
                setSelectedNodeIds([nodeId])
            } else {
                setSelectedNodeIds([])
            }
        }
    }

    return (
        <Card 
            className={cn(
                "drag-handle border-2 border-gray-300 w-[350px] text-wrap",
                props?.id && selectedNodeIds.includes(props?.id) ? "border-gray-900 border-2 click-project-step" : "",
                props.id === "preview" ? "opacity-50" : "",
            )}
            style={{
                // transform the node so the 'snap to grid' point is centered in the node
                // this allows edges to be straight, and perfectly align handles no matter the node's card height
                transform: props.id === 'preview' ? 'translate(0%, 50%)' : 'translate(0%, -50%)',
            }}
            onClick={(e) => {
                handleEditClick(e, props.id)
            }}
        >
            <CardHeader className="py-4">
                {props.data?.contextMenuRef && (
                    <div className="absolute top-0 right-0 p-2">
                        <ProjectActionsMenu milestone={props.data as Milestone} organization={props?.data?.organization}/>
                    </div>
                )}
                <CardTitle className="text-gray-900">
                    {!props?.data?.isPublic && (
                        <PublicPrivateButton 
                            isPrivate={props.data?.private}
                            updateCallback={async (isPrivate) => {
                                if (props.data?.nodeId) {
                                    setMilestone(props.data.nodeId, {private: isPrivate})
                                }
                            }}
                        />
                        // props.data?.private ? (
                        //     <Button
                        //         className="inline-block align-middle mr-2 mb-1 h-fit w-fit p-1.5 bg-red-100 hover:bg-red-300"
                        //         onClick={(e) => {
                        //             e.stopPropagation()
                        //             if (props?.data?.nodeId) setMilestone(props.data.nodeId, {private: false})
                        //         }}
                        //     >
                        //         <Lock size={20} className="text-red-800"/>
                        //     </Button>
                        // ) : (
                        //     <Button
                        //         className="inline-block align-middle mr-2 mb-1 h-fit w-fit p-1.5 bg-green-100 hover:bg-green-300"
                        //         onClick={(e) => {
                        //             e.stopPropagation()
                        //             if (props?.data?.nodeId) setMilestone(props.data.nodeId, {private: true})
                        //         }}
                        //     >
                        //         <Globe size={20} className="text-green-800"/>
                        //     </Button>
                        // )
                    )}
                    {props.data?.title || "New Milestone"}
                </CardTitle>
                {/* <CardDescription className="line-clamp-2">
                    {truncate(props.data?.description || "", 200)}
                </CardDescription> */}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <ul className="w-full flex flex-row flex-wrap gap-2 text-sm text-wrap break-words">
                    {(props?.data?.types || []).sort((a, b) => a?.milestoneType?.label && b?.milestoneType?.label ? a?.milestoneType?.label.length - b?.milestoneType?.label.length : 0).map((milestoneType, index) => (
                        <li key={index}>
                            <Badge className="w-fit" variant={'lightBlue'}>
                                {milestoneType?.milestoneType?.label || "No type"}
                            </Badge>
                        </li>
                    ))}

                    {(props.data?.contacts || []).map((contact, index) => {
                        if (contact.affiliation) {
                            return (
                                <li key={index}>
                                    <Badge>
                                        <User size={18}/>
                                        <p className="w-[90%] text-wrap break-words">{contact.affiliation}</p>
                                    </Badge>
                                </li>
                            )
                        }
                    })}

                    {(props?.data?.startDate || props?.data?.endDate) && (
                        <li>
                            <Badge>
                                <DateView startDate={props.data?.startDate || undefined} endDate={props.data?.endDate || undefined}/>
                            </Badge>
                        </li>
                    )}

                    {(!!props?.data?.budget) && (
                        <li>
                            <Badge>
                                <DollarSign size={16}/>
                                <p>{formatMoney(props?.data?.budget)}</p>
                            </Badge>
                        </li>
                    )}

                    {(props.data?.biosamples?.length > 0 || props.data?.diseaseModels?.length > 0 || props.data?.tools?.length > 0) && (
                        <li>
                            <Badge variant={'green'}>
                                <Microscope size={16} />
                                {(props.data?.biosamples?.length + props.data?.diseaseModels?.length + props.data?.tools?.length) <= 1 
                                    ? `1 Linked tool` 
                                    : `${(props.data?.biosamples?.length + props.data?.diseaseModels?.length + props.data?.tools?.length)} Linked tools`}
                            </Badge>
                        </li>
                    )}

                    {(props.data?.rfps?.length > 0) && (
                        <li>
                            <Badge variant={'orange'}>
                                <Microscope size={16} />
                                {(props.data?.rfps?.length) <= 1 
                                    ? `1 Linked RFP` 
                                    : `${(props.data?.rfps?.length)} Linked RFPs`}
                            </Badge>
                        </li>
                    )}
                </ul>

                <StatusButton 
                    status={props.data?.status as StatusType || undefined}
                    minimal={true}
                    disabled={true}
                    onStatusChange={() => {}}
                />

                {/* {(props.data?.biosamples?.length > 0 || props.data?.diseaseModels?.length > 0 || props.data?.tools?.length > 0 || props.data?.rfps?.length > 0) && (
                    <>
                    <Separator className="bg-gray-300 h-[2px] rounded-full my-4"/>
                        {(props.data?.biosamples?.length > 0 || props.data?.diseaseModels?.length > 0 || props.data?.tools?.length > 0) && (
                            <div className="border-l-4 border-green-200 pl-4 space-y-3">
                                <div className="h-full flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Microscope className="h-4 w-4 min-w-4 text-green-900" />
                                    <span className="text-green-900 text-nowrap">Linked Tools</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(props.data?.biosamples || []).map(({biosample}, index) => {
                                        return (
                                            <Badge key={index} variant="green">
                                                <TestTubeDiagonal className="h-4 w-4" />
                                                {`${biosample.id}`}
                                            </Badge>
                                        )
                                    })}
                                    {(props.data?.diseaseModels || []).map(({diseaseModel}, index) => {
                                        return (
                                            <Badge key={index} variant="green">
                                                <Rat className="h-4 w-4" />
                                                {`${diseaseModel.id}`}
                                            </Badge>
                                        )
                                    })}
                                    {(props.data?.tools || []).map(({tool}, index) => (
                                        <Badge key={index} variant="green">
                                            <Database className="h-4 w-4" />
                                            {`${tool?.id}`}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {props.data?.rfps?.length > 0 && (
                            <div className="border-l-4 border-orange-200 pl-4 space-y-3">
                                <div className="h-full flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Megaphone className="h-4 w-4 min-w-4 text-orange-900" />
                                    <span className="text-orange-900 text-nowrap">Linked RFPs</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {props.data?.rfps.map(({rfp}, index) => (
                                        <Badge key={index} variant="orange">
                                            <Megaphone className="h-4 w-4 min-w-4" />
                                            {`${rfp?.title}`}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )} */}
            </CardContent>

            {props.data?.contextMenuRef && props.id !== "preview" ? (
                <>
                    <NodeHandle 
                        type="target" 
                        position={Position.Left} 
                        node={props as NodeProps<MilestoneNodeType>}
                    />
                    <NodeHandle 
                        type="source" 
                        position={Position.Right}
                        node={props as NodeProps<MilestoneNodeType>}
                    />
                </>
            ): (
                <>
                    <Handle
                        type="target"
                        position={Position.Left}
                        className="z-10 bg-black p-1 rounded-full border-solid border-black border-2"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        className="z-10 bg-black p-1 rounded-full border-solid border-black border-2"
                    />
                </>
            )}
        </Card>
    )
}

export const NodeHandle = (props: HandleProps & { node: NodeProps<MilestoneNodeType> }) => {
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

function PublicMilestoneNodeButton(props: NodeProps<MilestoneNodeType>) {
    return(
        <div onClick={() => {
            if (props.data.setUrlMilestone) {
                props.data.setUrlMilestone(props.data.id)
            }
        }}>
            <MilestoneNode {...props} />
        </div>
    )
}

function PublicMilestoneNodeLink(props: NodeProps<MilestoneNodeType>) {
    return (
        <a 
            href={
                props?.data?.subdomain && !props.data?.private ? 
                    `http://${props.data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/?milestone=${props?.data?.id}&view=flow` :
                    '/'
            }
            className={cn(props.data?.private ? "pointer-events-none": "")}
            target={props.data.externalLink ? "_blank" : ""}
        >
            <MilestoneNode {...props} />
        </a>
    )
}

// export default memo(PublicMilestoneNodeLink)
export const MemoPublicMilestoneNodeLink = memo(PublicMilestoneNodeLink)
export const MemoPublicMilestoneNodeButton = memo(PublicMilestoneNodeButton)

export default memo(MilestoneNode)
