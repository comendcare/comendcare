"use client"

import React, { memo, useEffect, useState } from "react"
import { Handle, Position, Node, NodeProps } from "@xyflow/react"
import { Button } from "./ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/card"
import { useSearchParams } from "next/navigation"
import { getMilestoneDetails } from "@/lib/fetchers"
import { toast } from "sonner"

export async function PublicMilestoneDetails() {
    const searchParams = useSearchParams()
    const urlMilestone = searchParams.get("milestone")
    const [milestone, setMilestone] = useState<any>()

    useEffect(() => {
        if (urlMilestone) {
            getMilestoneDetails(urlMilestone).then(response => {
                if (response.success) {
                    setMilestone(response.milestone)
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }
            })
        }
    }, [urlMilestone])

    if (milestone) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{milestone.title}</CardTitle>
                    <CardDescription>{milestone.description}</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>No milestone selected!</CardTitle>
                <CardDescription>Select a milestone from the timeline or flow to see more details about it.</CardDescription>
            </CardHeader>
        </Card>
    )
}
