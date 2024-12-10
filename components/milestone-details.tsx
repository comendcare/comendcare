"use client"

import React from "react"
import { ScrollArea } from "./ui/scroll-area"
import StatusButton, { StatusType } from "./milestone-status-button"
import { FaDollarSign } from "react-icons/fa6"
import { Label } from "./ui/label"
import { TaskType } from "./private-milestone-node"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card"
import { MILESTONE_TYPE_OPTIONS } from "@/lib/types"
import { Badge } from "./ui/badge"
import { DateView } from "./miletone-date-view"
import { BudgetView } from "./milestone-budget-view"
import { AssetEditForm } from "./asset-edit-form"
import { AssetDetails } from "./asset-details"

export function MilestoneDetails({ milestone }: { milestone: any }) {
    return (
        <Card>
            <CardHeader className="flex flex-row gap-4">
                <span className="flex flex-col gap-4 grow">
                    <CardTitle>{milestone.title}</CardTitle>
                    <CardDescription>{milestone.description}</CardDescription>
                </span>
                <StatusButton
                    disabled={true}
                    status={milestone.status}
                    onStatusChange={() => {}}
                />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <span className="w-full flex">
                    <Badge className="flex text-sm">
                        {MILESTONE_TYPE_OPTIONS.find((option) => (option.value === milestone.type))?.label || "No type"}
                    </Badge>
                </span>

                <DateView startDate={milestone.startDate} endDate={milestone.endDate}/>

                <BudgetView budget={milestone.budget} />

                {milestone.asset && (
                    <AssetDetails asset={milestone.asset} />
                )}
            </CardContent>
        </Card>
    )
}
