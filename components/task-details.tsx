"use client"

import React from "react"
import { ScrollArea } from "./ui/scroll-area"
import StatusButton, { StatusType } from "./milestone-status-button"
import { FaDollarSign } from "react-icons/fa6"
import { Label } from "./ui/label"
import { TaskType } from "./milestone-node"
import { Checkbox } from "./ui/checkbox"

export function TaskDetails({ taskData }: { taskData: any }) {
    return (
        <ScrollArea>
            <div className="flex flex-col gap-8 pr-4">
                <div className="flex flex-col grow gap-2">
                    <Label className="text-xl">Task Status:</Label>
                    <StatusButton
                        disabled={true}
                        status={taskData.status}
                        onStatusChange={() => {}} // disabled
                    />
                </div>

                <div className="flex flex-col grow gap-2">
                    <Label htmlFor="name" className="text-xl">
                        Name:
                    </Label>
                    <p id="name">{taskData.name || "No name set"}</p>
                </div>

                <div className="flex flex-col grow gap-2">
                    <Label htmlFor="description" className="text-xl">
                        Description:
                    </Label>
                    <p id="description">
                        {taskData.description || "No description set"}
                    </p>
                </div>

                <div className="flex flex-col grow gap-2">
                    <Label htmlFor="checklist" className="text-xl">
                        Checklist:
                    </Label>
                    {taskData.checklist && taskData.checklist.length > 0 ? (
                        <ol id="checklist" className="flex flex-col gap-2">
                            {taskData.checklist.map(
                                (item: any, index: number) => (
                                    <li key={index} className="flex gap-2 items-center">
                                        <Checkbox checked={item.complete} disabled={true} />
                                        <p>{item.name}</p>
                                    </li>
                                )
                            )}
                        </ol>
                    ) : (
                        <p>{"This task does not have a checklist"}</p>
                    )}
                </div>
            </div>
        </ScrollArea>
    )
}
