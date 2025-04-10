"use client"

import React, { memo, useState } from "react"
import { Button } from "./ui/button"
import { StatusType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"

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
            styling: "bg-planned text-planned-foreground disabled:opacity-100 hover:bg-planned/90"
        },
        INPROGRESS: {
            text: "In Progress",
            styling: "bg-inprogress text-inprogress-foreground disabled:opacity-100 hover:bg-inprogress/90"
        },
        COMPLETED: {
            text: "Completed",
            styling: "bg-completed text-completed-foreground disabled:opacity-100 hover:bg-completed/90"
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
        <Badge
            // disabled={disabled}
            className={cn(`${StatusData[status]?.styling}`, className, "flex justify-center")}
            onClick={handleStateChange}
        >
            {StatusData[status]?.text}
        </Badge>
    )
}
