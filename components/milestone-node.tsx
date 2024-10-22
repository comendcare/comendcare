import React, { memo, useState } from "react"
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
import TaskStatusButton from "./task-status-button"
import {
    FaCalendar,
    FaCircleMinus,
    FaDollarSign,
    FaNoteSticky,
    FaPeopleGroup,
    FaTag,
    FaUser
} from "react-icons/fa6"

export type MilestoneNode = Node<
    {
        title: string
        description?: string
        deadline?: Date
        stakeholders?: string[]
        labels?: string[]
        subtasks: TaskType[]
        dependencies?: string[]
        budget?: number
        notes?: string
        status: StatusType
        handleEditClick: (nodeId: string) => void
    },
    "milestone"
>

interface TaskType {
    name: string
    complete: boolean
}

type StatusType = "todo" | "inprogress" | "done"

function MilestoneNode(props: NodeProps<MilestoneNode>) {
    const handleEditClick = () => {
        if (props.data?.handleEditClick) {
            props.data.handleEditClick(props.id)
        }
    }

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>{props.data?.title}</CardTitle>
                <CardDescription>{props.data?.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">
                {props.data?.deadline && (
                    <span className="flex gap-2 items-center">
                        <FaCalendar size={24} />
                        <p>{props.data.deadline.toDateString()}</p>
                    </span>
                )}

                {props.data?.stakeholders &&
                    props.data?.stakeholders.length > 0 && (
                        <span className="flex gap-2 items-center">
                            <FaUser size={24} />
                            <p>{props.data.stakeholders.join(", ")}</p>
                        </span>
                    )}

                {props.data?.labels && props.data?.labels.length > 0 && (
                    <span className="flex gap-2 items-center">
                        <FaTag size={24} />
                        <p>{props.data.labels.join(", ")}</p>
                    </span>
                )}

                <ul className="flex flex-col gap-2">
                    {props.data?.subtasks?.map((task, index) => (
                        <li
                            key={index}
                            className="flex flex-row gap-2 items-center"
                        >
                            <TaskStatusButton task={task} />
                            <p>{task.name}</p>
                        </li>
                    ))}
                </ul>

                {props.data?.dependencies &&
                    props.data?.dependencies.length > 0 && (
                        <span className="flex gap-2 items-center">
                            <FaCircleMinus size={24} />
                            <p>{props.data.dependencies.join(", ")}</p>
                        </span>
                    )}

                {props.data?.budget && (
                    <span className="flex gap-2 items-center">
                        <FaDollarSign size={24} />
                        <p>{props.data.budget.toLocaleString()}</p>
                    </span>
                )}

                {props.data?.notes && (
                    <span className="flex gap-2 items-center">
                        <FaNoteSticky size={24} />
                        <p>{props.data.notes}</p>
                    </span>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <MilestoneStatusButton milestoneStatus={props.data?.status} />
                <Button onClick={handleEditClick}>{`Edit Details`}</Button>
            </CardFooter>

            <Handle type="target" position={Position.Left} className="h-16" />
            <Handle type="source" position={Position.Right} className="h-16" />
        </Card>
    )
}

function MilestoneStatusButton({
    milestoneStatus
}: {
    milestoneStatus: StatusType
}) {
    const [status, setStatus] = useState(milestoneStatus)

    const StatusData = {
        todo: {
            text: "TODO",
            styling: "bg-red-100 border-red-600 text-red-600 hover-red-400"
        },
        inprogress: {
            text: "IN PROGRESS",
            styling: "bg-yellow-100 border-yellow-600 text-yellow-600"
        },
        done: {
            text: "DONE",
            styling: "bg-green-100 border-green-600 text-green-600"
        }
    }

    const handleStateChange = () => {
        if (status === "todo") {
            setStatus("inprogress")
        } else if (status === "inprogress") {
            setStatus("done")
        } else {
            setStatus("todo")
        }
    }

    return (
        <Button
            className={`${StatusData[status].styling}`}
            onClick={handleStateChange}
        >
            {StatusData[status].text}
        </Button>
    )
}

export default memo(MilestoneNode)
