import React from "react"
import { FaCalendar } from "react-icons/fa6"
import {monthsList} from "@/lib/data";

export function DateView({startDate, endDate}: {startDate: Date | undefined, endDate: Date | undefined}) {
    if (startDate && endDate) {
        return (
            <span className="flex items-center text-bottom">
                <FaCalendar 
                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                />
                <p>{`${monthsList[startDate.getMonth()]} ${startDate.getFullYear()} - ${monthsList[endDate.getMonth()]} ${endDate.getFullYear()}`}</p>
            </span>
        )
    } else if (startDate) {
        return (
            <span className="flex items-center text-bottom">
                <FaCalendar 
                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                />
                <p>{`${monthsList[startDate.getMonth()]} ${startDate.getFullYear()}`}</p>
            </span>
        )
    } else if (endDate) {
        return (
            <span className="flex items-center text-bottom">
                <FaCalendar 
                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                    aria-hidden="true"
                />
                <p>{`${monthsList[endDate.getMonth()]} ${endDate.getFullYear()}`}</p>
            </span>
        )
    }
}
