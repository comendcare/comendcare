"use client"

import React, { memo, useState } from 'react';
import { FaCheck } from 'react-icons/fa6';
import { Button } from './ui/button';

export default function TaskStatusButton({ complete, onClick }: { complete: boolean, onClick: (complete: boolean) => void }) {
    const handleStateChange = (e: any) => {
        e.preventDefault()
        
        onClick(!complete)
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
