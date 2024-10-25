"use client"

import React, { memo, useState } from "react"
import { Button } from "./ui/button"

export type StatusType = "TODO" | "INPROGRESS" | "DONE"

export default function StatusButton({
    status = "TODO",
    disabled = false,
    onStatusChange
}: {
    status?: StatusType
    disabled?: boolean | undefined
    onStatusChange: (status: StatusType) => void
}) {
    const StatusData = {
        TODO: {
            text: "To Do",
            styling: "bg-red-100 border-red-600 text-red-800 hover-red-400 disabled:opacity-100"
        },
        INPROGRESS: {
            text: "In Progress",
            styling: "bg-yellow-100 border-yellow-600 text-yellow-800 disabled:opacity-100"
        },
        DONE: {
            text: "Done",
            styling: "bg-green-100 border-green-600 text-green-800 disabled:opacity-100"
        }
    }

    const handleStateChange = (e: any) => {
        e.preventDefault()

        if (status === "TODO") {
            onStatusChange("INPROGRESS")
        } else if (status === "INPROGRESS") {
            onStatusChange("DONE")
        } else {
            onStatusChange("TODO")
        }
    }

    return (
        <Button
            disabled={disabled}
            className={`${StatusData[status].styling}`}
            onClick={handleStateChange}
        >
            {StatusData[status].text}
        </Button>
    )
}
