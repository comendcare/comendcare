"use client"

import React, { memo, useState } from 'react';
import { FaCheck } from 'react-icons/fa6';
import { Button } from './ui/button';

interface TaskType {
    name: string,
    complete: boolean
}

export default function TaskStatusButton({ task }: { task: TaskType }) {
    const [complete, setComplete] = useState(task.complete)

    const handleStateChange = () => {
        setComplete(!complete)
    }

    return (
        <Button 
            variant="outline"  
            size="icon" 
            onClick={handleStateChange}
            className={`rounded-full h-6 w-6 ${complete ? 'text-green-600': 'text-red-600'}`}
        >
            <FaCheck />
        </Button>
    )
}
