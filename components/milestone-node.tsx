import React, { memo, useState } from 'react';
import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import { FaCheck } from 'react-icons/fa6';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export type MilestoneNode = Node<
  {
    name: string,
    description?: string,
    tasks: TaskType[]
    notes?: string,
    status: StatusType,
    handleEditClick: (nodeId: string) => void
  },
  'milestone'
>

interface TaskType {
    name: string,
    complete: boolean
}

type StatusType = 'todo' | 'inprogress' | 'done'

function MilestoneNode(props: NodeProps<MilestoneNode>) {

    const handleEditClick = () => {
        if (props.data?.handleEditClick) {
            props.data.handleEditClick(props.id);
        }
    }

    return (
        <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{props.data?.name}</CardTitle>
          <CardDescription>{props.data?.description}</CardDescription>
        </CardHeader>
        <CardContent>
                <ul className="flex flex-col gap-2"> 
                    {props.data?.tasks.map((task, index) => (
                        <li key={index} className="flex flex-row gap-2 items-center">
                            <TaskStatusButton task={task} />
                            <p>{task.name}</p>
                        </li>
                    ))}
                </ul>
                <p>{props.data?.notes}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
            <MilestoneStatusButton milestoneStatus={props.data?.status} />
            <Button onClick={handleEditClick}>{`Edit Details`}</Button>
        </CardFooter>

        <Handle
                type="target" 
                position={Position.Left}
                className="h-16"
            /> 
        <Handle
                type="source"
                position={Position.Right}
                className="h-16"
            />
      </Card>
    );
}

function MilestoneStatusButton({ milestoneStatus }: { milestoneStatus: StatusType }) {
    const [status, setStatus] = useState(milestoneStatus)

    const StatusData = {
        'todo': {
            text: 'TODO',
            styling: 'bg-red-100 border-red-600 text-red-600 hover-red-400',
        },
        'inprogress': {
            text: 'IN PROGRESS',
            styling: 'bg-yellow-100 border-yellow-600 text-yellow-600',
        },
        'done': {
            text: 'DONE',
            styling: 'bg-green-100 border-green-600 text-green-600',
        }
    }

    const handleStateChange = () => {
        if (status === 'todo') {
            setStatus('inprogress')
        } else if (status === 'inprogress') {
            setStatus('done')
        } else {
            setStatus('todo')
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

function TaskStatusButton({ task }: { task: TaskType }) {
    const [complete, setComplete] = useState(task.complete)

    return (
        <Button 
            variant="outline"  
            size="icon" 
            onClick={() => { setComplete(!complete) }}
            className={`rounded-full h-6 w-6 ${complete ? 'text-green-600': 'text-red-600'}`}
        >
            <FaCheck />
        </Button>
    )
}

export default memo(MilestoneNode);
