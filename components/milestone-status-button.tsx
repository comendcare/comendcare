import React, { memo, useState } from 'react';
import { Button } from './ui/button';

export type StatusType = 'todo' | 'inprogress' | 'done'

export default function MilestoneStatusButton({ milestoneStatus = 'todo' }: { milestoneStatus: StatusType | undefined }) {
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