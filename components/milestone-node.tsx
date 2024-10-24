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
import { FaCalendar } from "react-icons/fa6"
import StatusButton from "./milestone-status-button"
import { truncate } from "@/lib/utils"

export type MilestoneNode = Node<
    {
        nodeId: string
        title: string
        description?: string
        timelineMonth?: string
        timelineYear?: string
        budget?: number
        papers?: string[]
        stakeholders?: string[]
        labels?: string[]
        // tasks: TaskType[],
        dependencies?: string[]
        notes?: string
        status: StatusType
        handleEditClick: (nodeId: string) => void
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
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>{props.data?.title || "New Milestone"}</CardTitle>
                {/* Description length in node is truncated to 200 characters. */}
                <CardDescription>
                    {truncate(props.data?.description || "", 200)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
                {(props.data?.timelineMonth || props.data?.timelineYear) && (
                    <span className="flex gap-2 items-center text-bottom">
                        <FaCalendar size={24} />
                        <p>{props.data?.timelineMonth}</p>
                        <p>{props.data?.timelineYear}</p>
                    </span>
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
                    status={props.data.status}
                    onStatusChange={() => {}}
                />
                <Button onClick={handleEditClick}>{`Details`}</Button>
            </CardFooter>

            <Handle type="target" position={Position.Left} className="h-16" />
            <Handle type="source" position={Position.Right} className="h-16" />
        </Card>
    )
}

export default memo(MilestoneNode)
