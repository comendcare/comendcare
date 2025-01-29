"use client"

import React, { memo, useState } from "react"
import { Button } from "./ui/button"
import { StatusType } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function StatusButton({
    status = "PLANNED",
    disabled = false,
    onStatusChange,
    className
}: {
    status?: StatusType
    disabled?: boolean | undefined
    onStatusChange: (status: StatusType) => void
    className?: string
}) {
    const StatusData = {
        PLANNED: {
            text: "Planned",
            styling: "bg-red-100 border-red-600 text-red-800 hover-red-400 disabled:opacity-100 hover:bg-red-200"
        },
        INPROGRESS: {
            text: "In Progress",
            styling: "bg-yellow-100 border-yellow-600 text-yellow-800 disabled:opacity-100 hover:bg-yellow-200"
        },
        COMPLETED: {
            text: "Completed",
            styling: "bg-green-100 border-green-600 text-green-800 disabled:opacity-100 hover:bg-green-200"
        }
    }

    const handleStateChange = (e: any) => {
        e.preventDefault()

        if (status === "PLANNED") {
            onStatusChange("INPROGRESS")
        } else if (status === "INPROGRESS") {
            onStatusChange("COMPLETED")
        } else {
            onStatusChange("PLANNED")
        }
    }

    return (
        <Button
            disabled={disabled}
            className={cn(`${StatusData[status]?.styling}`, className)}
            onClick={handleStateChange}
        >
            {StatusData[status]?.text}
        </Button>
    )
}
