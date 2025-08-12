import React, { memo } from "react"
import { Handle, Position, Node, NodeProps } from "@xyflow/react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@comend/components/ui/card"
import { truncate, cn } from "@comend/lib/utils"
import { PrivateBadge } from "./private-badge"
import { StatusType } from "@comend/lib/types"
import { CardContents } from "./private-milestone-node"
import { MilestoneType } from "@prisma/client"
import { Box, Calendar, ExternalLink, User } from "lucide-react"
import { Tool as DBAsset, RFP as DBRFP } from "@prisma/client"
import { Badge } from "@/packages/components/ui/badge"
import { PropertyBadge } from "./property-badge"
import { DateView } from "./miletone-date-view"
import StatusButton from "./milestone-status-button"
import { Separator } from "@/packages/components/ui/separator"

export type PublicMilestoneNode = Node<
    {
        id: string
        nodeId: string
        title: string
        description?: string
        types?: {milestoneId: string, milestoneTypeId: string, milestoneType: MilestoneType}[],
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
        // handleEditClick: (nodeId: string) => void,
        onboardingMilestone: boolean
        private: boolean
        subdomain: string | undefined,
        externalLink: boolean,
        focused: boolean
        contacts: any[],
        setUrlMilestone?: (id: string) => void | undefined,
            tools: Array<{
                    tool?: DBAsset,
                    milestoneId?: string,
                    toolId: string
                }>,
            rfps: Array<{
                    rfp?: DBRFP,
                    milestoneId?: string,
                    rfpId: string,
                }>
    },
    "PROJECT" | "ASSET" | "RFP"
>

export interface TaskType {
    id?: string
    name: string
    status: StatusType
}

function PublicMilestoneNodeContents({props}: {props: NodeProps<PublicMilestoneNode>}) {
    return (
        <Card 
            className={cn(
                // "w-[350px] text-wrap break-words", 
                // props.data?.focused ? "border-2 border-black" : ""
                "border-2 border-blue-300 bg-blue-50/75 w-[350px] text-wrap",
                props.data?.focused ? "border-blue-900 border-2" : "",
                props.id === "preview" ? "opacity-50" : "",
            )}
        >
            <CardHeader>
                {/* <div className="h-fit flex flex-row align-center items-center justify-end gap-4">
                    {!props.data?.private && props.data.externalLink && <ExternalLink className="h-[20px] w-[20px]"/>}
                </div> */}
                <CardTitle className="text-blue-900">
                    {props.data?.title || "New Milestone"}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                    {truncate(props.data?.description || "", 200)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                {/* <div className="flex flex-col gap-2">
                    <CardTitle>{props.data?.title || "New Milestone"}</CardTitle>
                    <CardDescription className="text-wrap break-words line-clamp-2">
                        {truncate(props.data?.description || "", 200)}
                    </CardDescription>
                </div>

                <CardContents props={props}/> */}

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

                <StatusButton 
                    status={props.data?.status as StatusType || undefined}
                    minimal={true}
                    disabled={true}
                    onStatusChange={() => {}}
                />

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
                    <PrivateBadge className="justify-start" />
                </CardFooter>
            )}

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
        </Card>
    )
}

function PublicMilestoneNodeButton(props: NodeProps<PublicMilestoneNode>) {
    return(
        <div onClick={() => {
            if (props.data.setUrlMilestone) {
                props.data.setUrlMilestone(props.data.id)
            }
        }}>
            <PublicMilestoneNodeContents props={props} />
        </div>
    )
}

function PublicMilestoneNodeLink(props: NodeProps<PublicMilestoneNode>) {
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
            <PublicMilestoneNodeContents props={props} />
        </a>
    )
}

// export default memo(PublicMilestoneNodeLink)
export const MemoPublicMilestoneNodeLink = memo(PublicMilestoneNodeLink)
export const MemoPublicMilestoneNodeButton = memo(PublicMilestoneNodeButton)
