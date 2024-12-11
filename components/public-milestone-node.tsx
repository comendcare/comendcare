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
import { MILESTONE_TYPE_OPTIONS } from "@/lib/types"

export type PublicMilestoneNode = Node<
    {
        id: string
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
        // handleEditClick: (nodeId: string) => void,
        onboardingMilestone: boolean
        private: boolean
        subdomain: string | undefined
    },
    "MILESTONE"
>

export interface TaskType {
    id?: string
    name: string
    status: StatusType
}

type StatusType = "TODO" | "INPROGRESS" | "DONE"

function PublicMilestoneNode(props: NodeProps<PublicMilestoneNode>) {
    return (
        <a href={
            props?.data?.subdomain ? 
                `http://${props.data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/roadmap/?milestone=${props?.data?.id}&view=flow` :
                ''
            }
            target="_blank"
        >
        <Card className={cn("w-[350px]", props.data?.onboardingMilestone ? "research-plan-tour-step2" : "")}>
            <CardHeader>
                {props.data?.private && (
                    <PrivateBadge className="-mt-2 justify-end" />
                )}
                <CardTitle className="flex flex-row gap-4 justify-between w-full">
                    {props.data?.title || "New Milestone"}
                    <FaArrowUpRightFromSquare className="h-[20px] w-[20px]"/>
                </CardTitle>
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
            </CardContent>
            <CardFooter className="flex justify-between">
                <StatusButton
                    disabled={true}
                    status={props.data.status}
                    onStatusChange={() => {}}
                />
            </CardFooter>

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
