import React from "react"
import {monthsList} from "@/lib/data";
import { Calendar } from "lucide-react";

export function DateView({
    startDate, 
    endDate, 
    startLabel, 
    endLabel, 
    specific = false
}: {
    startDate: Date | undefined, 
    endDate: Date | undefined, 
    startLabel?: string | undefined, 
    endLabel?: string | undefined, 
    specific?: boolean
}) {
    if (startDate && endDate) {
        if (typeof startDate === 'string') startDate = new Date(startDate)
        if (typeof endDate === 'string') endDate = new Date(endDate)

        return (
            <span className="flex items-center gap-2 text-bottom">
                {specific ? (
                    <p>
                        {`${startDate.toLocaleDateString(
                            "en-US", 
                            { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric'
                            }
                        )} - ${endDate.toLocaleDateString(
                            "en-US",
                            {
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric'
                            }
                        )}`}
                    </p>
                ): (
                    <p>{`${monthsList[startDate.getMonth()]} ${startDate.getFullYear()} - ${monthsList[endDate.getMonth()]} ${endDate.getFullYear()}`}</p>
                )}
            </span>
        )
    } else if (startDate) {
        if (typeof startDate === 'string') startDate = new Date(startDate)

        return (
            <span className="flex items-center gap-2 text-bottom">
                <Calendar 
                    aria-hidden="true"
                    className="h-4 w-4"
                />
                {specific ? (
                    <p>
                        {`${startDate.toLocaleDateString(
                            "en-US", 
                            { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric'
                            }
                        )}`}
                    </p>
                ): (
                    <p>{`${startLabel || "Starting:"} ${monthsList[startDate.getMonth()]} ${startDate.getFullYear()}`}</p>
                )}
            </span>
        )
    } else if (endDate) {
        if (typeof endDate === 'string') endDate = new Date(endDate)

        return (
            <span className="flex items-center gap-2 text-bottom">
                <Calendar 
                    aria-hidden="true"
                    className="h-4 w-4"
                />
                {specific ? (
                    <p>
                        {`${endDate.toLocaleDateString(
                            "en-US",
                            {
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric'
                            }
                        )}`}
                    </p>
                ): (
                    <p>{`${endLabel || "Ending:"} ${monthsList[endDate.getMonth()]} ${endDate.getFullYear()}`}</p>
                )}
            </span>
        )
    }
}
