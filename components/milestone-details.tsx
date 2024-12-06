"use client"

import React from "react"
import { ScrollArea } from "./ui/scroll-area"
import StatusButton, { StatusType } from "./milestone-status-button"
import { FaDollarSign } from "react-icons/fa6"
import { Label } from "./ui/label"
import { TaskType } from "./private-milestone-node"

export function MilestoneDetails({ milestoneData }: { milestoneData: any }) {
    return (
        <ScrollArea>
            <div className="flex flex-col gap-8 pr-4">
                <div className="flex flex-col grow gap-2">
                    <Label className="text-xl">Milestone Status:</Label>
                    <StatusButton
                        disabled={true}
                        status={milestoneData.status}
                        onStatusChange={() => {}} // disabled
                    />
                </div>

                <div className="flex flex-col grow gap-2">
                    <Label htmlFor="title" className="text-xl">
                        Title:
                    </Label>
                    <p id="title">{milestoneData.title || "No title set"}</p>
                </div>

                <div className="flex flex-col grow gap-2">
                    <Label htmlFor="description" className="text-xl">
                        Description:
                    </Label>
                    <p id="description">
                        {milestoneData.description || "No description set"}
                    </p>
                </div>

                <div className="flex flex-col grow gap-2">
                    <Label htmlFor="timeline" className="text-xl">
                        Timeline:
                    </Label>
                    <span id="timeline" className="flex gap-4">
                        <span className="flex gap-2 items-center">
                            <Label htmlFor="timeline-month" className="text-xl">
                                Month:
                            </Label>
                            <p id="timeline-month">
                                {milestoneData.timelineMonth || "No month set"}
                            </p>
                        </span>
                        <span className="flex gap-2 items-center">
                            <Label htmlFor="timeline-year" className="text-xl">
                                Year:
                            </Label>
                            <p id="timeline-year">
                                {milestoneData.timelineYear || "No year set"}
                            </p>
                        </span>
                    </span>
                </div>

                <div className="flex flex-col grow gap-2">
                    <Label htmlFor="budget" className="text-xl">
                        Budget:
                    </Label>
                    <span className="flex gap-4">
                        <FaDollarSign size={24} />
                        <p id="budget">
                            {milestoneData.budget || "No budget set"}
                        </p>
                    </span>
                </div>

                <div className="flex flex-col grow gap-2">
                    <Label htmlFor="papers" className="text-xl">
                        Associated Papers:
                    </Label>
                    {milestoneData.papers && milestoneData.papers.length > 0 ? (
                        <ol id="papers">
                            {milestoneData.papers.map(
                                (paper: string, index: number) => (
                                    <li
                                        key={index}
                                    >{`${index + 1}. ${paper}`}</li>
                                )
                            )}
                        </ol>
                    ) : (
                        <p>{"No associated papers"}</p>
                    )}
                </div>

                <div className="flex flex-col grow gap-2">
                    <Label htmlFor="papers" className="text-xl">
                        Tasks:
                    </Label>
                    {milestoneData.tasks && milestoneData.tasks.length > 0 ? (
                        <ol id="tasks" className="flex flex-col gap-2">
                            {milestoneData.tasks.map(
                                (task: TaskType, index: number) => (
                                    <li key={index} className="flex justify-between items-center">
                                        <StatusButton disabled={true} status={task.status} onStatusChange={() => {}} />
                                        <p>{task.name}</p>
                                    </li>
                                )
                            )}
                        </ol>
                    ) : (
                        <p>{"This milestone has no tasks"}</p>
                    )}
                </div>
            </div>
        </ScrollArea>
    )
}
