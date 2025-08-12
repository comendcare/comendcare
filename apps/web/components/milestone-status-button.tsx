"use client"

import React, { memo, useState } from "react"
import { StatusType } from "@comend/lib/types"
import { cn } from "@comend/lib/utils"
import { Badge } from "@comend/components/ui/badge"

// export default function StatusButton({
//     status = "PLANNED",
//     disabled = false,
//     onStatusChange,
//     className
// }: {
//     status?: StatusType
//     disabled?: boolean | undefined
//     onStatusChange: (status: StatusType) => void
//     className?: string
// }) {
//     const StatusData = {
//         PLANNED: {
//             text: "Planned",
//             styling: "bg-planned text-planned-foreground disabled:opacity-100 hover:bg-planned/90"
//         },
//         INPROGRESS: {
//             text: "In Progress",
//             styling: "bg-inprogress text-inprogress-foreground disabled:opacity-100 hover:bg-inprogress/90"
//         },
//         COMPLETED: {
//             text: "Completed",
//             styling: "bg-completed text-completed-foreground disabled:opacity-100 hover:bg-completed/90"
//         }
//     }

//     const handleStateChange = (e: any) => {
//         e.preventDefault()

//         if (status === "PLANNED") {
//             onStatusChange("INPROGRESS")
//         } else if (status === "INPROGRESS") {
//             onStatusChange("COMPLETED")
//         } else {
//             onStatusChange("PLANNED")
//         }
//     }

//     return (
//         <Badge
//             // disabled={disabled}
//             className={cn(`${StatusData[status]?.styling}`, className, "flex justify-center")}
//             onClick={handleStateChange}
//         >
//             {StatusData[status]?.text}
//         </Badge>
//     )
// }

export default function StatusButton({
    status = "PLANNED",
    disabled = false,
    minimal = false,
    onStatusChange,
    className
}: {
    status?: StatusType
    disabled?: boolean | undefined
    minimal?: boolean | undefined,
    onStatusChange: (status: StatusType) => void
    className?: string | undefined
}) {
    const handleClick = () => {
        if (disabled) return

        if (status === "PLANNED") {
            onStatusChange("INPROGRESS")
        } else if (status === "INPROGRESS") {
            onStatusChange("COMPLETED")
        } else {
            onStatusChange("PLANNED")
        }
    }

    const getStatusIndex = (currentStatus: StatusType) => {
        switch (currentStatus) {
            case "PLANNED":
                return 0
            case "INPROGRESS":
                return 1
            case "COMPLETED":
                return 2
            default:
                return 0
        }
    }

    const getStatusColor = (currentStatus: StatusType) => {
        switch (currentStatus) {
            case "PLANNED":
                return "bg-planned"
            case "INPROGRESS":
                return "bg-inprogress"
            case "COMPLETED":
                return "bg-completed"
            default:
                return "bg-planned"
        }
    }

    const getStatusTextColor = (currentStatus: StatusType) => {
        switch (currentStatus) {
            case "PLANNED":
                return "text-planned-foreground"
            case "INPROGRESS":
                return "text-inprogress-foreground"
            case "COMPLETED":
                return "text-completed-foreground"
            default:
                return "text-planned-foreground"
        }
    }

    const getStatusBackgroundColor = (currentStatus: StatusType) => {
        switch (currentStatus) {
            case "PLANNED":
                return "bg-planned-foreground border-[1px] border-planned-foreground"
            case "INPROGRESS":
                return "bg-inprogress-foreground border-[1px] border-inprogress-foreground"
            case "COMPLETED":
                return "bg-completed-foreground border-[1px] border-completed-foreground"
            default:
                return "bg-planned-foreground border-[1px] border-planned-foreground"
        }
    }

    const currentIndex = getStatusIndex(status)

    if (minimal) {
        return (  
            <div
                className={cn(
                    "relative flex w-full mx-auto rounded-full h-8 cursor-pointer transition-all duration-300 overflow-hidden",
                    getStatusBackgroundColor(status),
                    "h-[14px]"
                )}
                onClick={handleClick}
            >
                <div
                    className={cn("absolute inset-0 transition-all duration-700 ease-out rounded-full", getStatusColor(status))}
                    style={{
                        width: `${((currentIndex + 1) / 3) * 100}%`,
                        transform: "translateX(0)",
                    }}
                />

                {/* Planned Section */}
                <div
                    className={cn(
                        "flex-1 flex items-center justify-center relative z-10",
                        currentIndex >= 0 ? getStatusTextColor(status) : "text-gray-600",
                    )}
                >
                    {/* {currentIndex === 0 && 'Planned'} */}
                </div>

                {/* In Progress Section */}
                <div
                    className={cn(
                        "flex-1 flex items-center justify-center relative z-10 -ml-4",
                        currentIndex >= 1 ? getStatusTextColor(status) : "text-gray-600",
                    )}
                >
                    {/* {currentIndex === 1 && 'In Progress'} */}
                </div>

                {/* Completed Section */}
                <div
                    className={cn(
                        "flex-1 flex items-center justify-center relative z-10 -ml-4",
                        currentIndex >= 2 ? getStatusTextColor(status) : "text-gray-600",
                    )}
                >
                    {/* {currentIndex === 2 && 'Completed'} */}
                </div>
            </div>
        )
    }

    return (  
        <div
            className={cn(
                "relative flex w-full mx-auto bg-gray-200 rounded-full h-8 cursor-pointer transition-all duration-300 overflow-hidden",
                // !disabled && "hover:bg-gray-300",
                getStatusBackgroundColor(status),
            )}
            onClick={handleClick}
        >
            <div
                className={cn("absolute inset-0 transition-all duration-700 ease-out rounded-full", getStatusColor(status))}
                style={{
                    width: `${((currentIndex + 1) / 3) * 100}%`,
                    transform: "translateX(0)",
                }}
            />

            {/* Planned Section */}
            <div
                className={cn(
                    "flex-1 flex items-center justify-end relative z-10 pr-2",
                    currentIndex >= 0 ? getStatusTextColor(status) : "text-gray-600",
                )}
            >
                {currentIndex === 0 && 'Planned'}
            </div>

            {/* In Progress Section */}
            <div
                className={cn(
                    "flex-1 flex items-center justify-end relative z-10 pr-2",
                    currentIndex >= 1 ? getStatusTextColor(status) : "text-gray-600",
                )}
            >
                {currentIndex === 1 && 'In Progress'}
            </div>

            {/* Completed Section */}
            <div
                className={cn(
                    "flex-1 flex items-center justify-end relative z-10 pr-2",
                    currentIndex >= 2 ? getStatusTextColor(status) : "text-gray-600",
                )}
            >
                {currentIndex === 2 && 'Completed'}
            </div>
        </div>
    )
}
