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
    CardHeader,
    CardTitle
} from "@comend/components/ui/card"
import StatusButton from "@comend/components/milestone-status-button"
import {cn, formatMoney} from "@comend/lib/utils"
import {DateView} from "@comend/components/milestone-date-view"
import {Badge, badgeVariants} from "@comend/components/ui/badge"
import {Milestone, MILESTONE_TYPE_OPTIONS, StatusType} from "@comend/lib/types"
import {RoadmapState, useRoadmapStore} from "./../state/roadmap/roadmapStore"
import {useShallow} from "zustand/react/shallow"
import { ExternalLink, Microscope, Plus, Trash, User, DollarSign } from "lucide-react"
import { ProjectActionsMenu } from "./project-actions-menu"
import { Organization } from "@prisma/client"
import { PublicPrivateButton } from "@comend/components/public-private-button"
import { Dialog, DialogContent, DialogTrigger } from "@comend/components/ui/dialog"
import { EditMilestoneForm } from "./edit-milestone-form"
import { updateMilestones } from "@comend/lib/actions"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { revalidate } from "@comend/lib/revalidate"
import LoadingDots from "@comend/components/icons/loading-dots"

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
    const {data: session} = useSession()
    const pathname = usePathname()
    const [isEditing, setIsEditing] = useState(false)

    if (!props.data.id && props.id !== 'preview') {
        return (
            <Card className="h-[100px] w-[250px] flex justify-center items-center">
                <LoadingDots />
            </Card>
        )
    }

    return (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
                <Card 
                    className={cn(
                        "drag-handle border-2 border-gray-300 w-[350px] text-wrap",
                        props.id === "preview" ? "opacity-50" : "",
                    )}
                    style={{
                        // transform the node so the 'snap to grid' point is centered in the node
                        // this allows edges to be straight, and perfectly align handles no matter the node's card height
                        transform: props.id === 'preview' ? 'translate(0%, 50%)' : 'translate(0%, -50%)',
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
                                            // setMilestone(props.data.nodeId, {private: isPrivate})
                                            const response = await updateMilestones(
                                                session?.user?.organizationId,
                                                {milestones: [{...props.data, private: isPrivate}]}
                                            )
                                            console.log(`revalidate milestone data`, response)    
                                            await revalidate(pathname)
                                        }
                                    }}
                                />
                            )}
                            {props.data?.title || "New Milestone"}
                        </CardTitle>
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
            </DialogTrigger>
            <DialogContent>
                <EditMilestoneForm 
                    organization={undefined}
                    milestoneData={props.data}
                    orgIsPublished={true}
                    biosampleOptions={[]}
                    diseaseModelOptions={[]}
                    clinicalDatasetOptions={[]}
                    rfpOptions={[]}
                    milestoneTypeOptions={MILESTONE_TYPE_OPTIONS}
                    onClose={() => setIsEditing(false)}
                />
            </DialogContent>
        </Dialog>
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
