"use client"

import React, { memo, useState } from 'react';
import { Button } from './ui/button';

export type StatusType = 'TODO' | 'INPROGRESS' | 'DONE'

export default function MilestoneStatusButton({ milestoneStatus = 'TODO' }: { milestoneStatus: StatusType | undefined }) {
    const [status, setStatus] = useState(milestoneStatus)

    const StatusData = {
        'TODO': {
            text: 'TODO',
            styling: 'bg-red-100 border-red-600 text-red-600 hover-red-400',
        },
        'INPROGRESS': {
            text: 'IN PROGRESS',
            styling: 'bg-yellow-100 border-yellow-600 text-yellow-600',
        },
        'DONE': {
            text: 'DONE',
            styling: 'bg-green-100 border-green-600 text-green-600',
        }
    }

    const handleStateChange = () => {
        if (status === 'TODO') {
            setStatus('INPROGRESS')
        } else if (status === 'INPROGRESS') {
            setStatus('DONE')
        } else {
            setStatus('DONE')
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