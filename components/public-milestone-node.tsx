import React, { memo } from "react"
import { Handle, Position, Node, NodeProps } from "@xyflow/react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card"
import { FaArrowUpRightFromSquare } from "react-icons/fa6"
import StatusButton from "./milestone-status-button"
import { truncate, cn } from "@/lib/utils"
import { PrivateBadge } from "./private-badge"
import { Badge } from "./ui/badge"
import { MILESTONE_TYPE_OPTIONS, StatusType } from "@/lib/types"
import { CardContents, TypeBadge } from "./private-milestone-node"

export type PublicMilestoneNode = Node<
    {
        id: string
        nodeId: string
        title: string
        description?: string
        types?: string[],
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
    },
    "PROJECT" | "ASSET" | "RFP"
>

export interface TaskType {
    id?: string
    name: string
    status: StatusType
}

function PublicMilestoneNode(props: NodeProps<PublicMilestoneNode>) {
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
        <Card 
            className={cn(
                "w-[350px] text-wrap break-words", 
                props.data?.onboardingMilestone ? "research-plan-tour-step2" : "",
                props.data?.focused ? "border-2 border-black" : ""
            )}
        >
            <CardHeader>
                <div className="h-fit flex flex-row align-center items-center justify-between gap-4">
                    <TypeBadge type={props.type}/>
                    {!props.data?.private && props.data.externalLink && <FaArrowUpRightFromSquare className="h-[20px] w-[20px]"/>}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <CardTitle>{props.data?.title || "New Milestone"}</CardTitle>
                    <CardDescription className="text-wrap break-words line-clamp-2">
                        {truncate(props.data?.description || "", 200)}
                    </CardDescription>
                </div>

                <CardContents props={props}/>
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
        </a>
    )
}

export default memo(PublicMilestoneNode)
