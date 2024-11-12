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
import { FaArrowRight, FaCalendar, FaPlus } from "react-icons/fa6"
import StatusButton from "./milestone-status-button"
import { truncate, monthsList, cn } from "@/lib/utils"
import { DateView } from "./miletone-date-view"

export type MilestoneNode = Node<
    {
        nodeId: string
        title: string
        description?: string
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
        onboardingMilestone: boolean
    },
    "MILESTONE"
>

export interface TaskType {
    id?: string
    name: string
    status: StatusType
}

type StatusType = "TODO" | "INPROGRESS" | "DONE"

function MilestoneNode(props: NodeProps<MilestoneNode>) {
    const handleEditClick = () => {
        if (props.data?.handleEditClick) {
            props.data.handleEditClick(props?.id)
        }
    }

    return (
        <Card className={cn("w-[350px]", props.data?.onboardingMilestone ? "roadmap-tour-step2" : "")}>
            <CardHeader>
                <CardTitle>{props.data?.title || "New Milestone"}</CardTitle>
                {/* Description length in node is truncated to 200 characters. */}
                <CardDescription>
                    {truncate(props.data?.description || "", 200)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
                {(props.data?.startDate?.getMonth() || props.data?.endDate?.getFullYear()) && (
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
                className={cn("z-10 bg-white p-1 transition-all hover:p-2 rounded-full border-solid border-black border-2", props.data?.onboardingMilestone ? "roadmap-tour-step5": "")}
            >
                <FaPlus className="pointer-events-none" />
            </Handle>
        </Card>
    )
}

export default memo(MilestoneNode)
