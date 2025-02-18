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
import { MilestoneDetails } from "./milestone-details"

export function PublicMilestoneDetails({roadmap, urlMilestone}: {roadmap: any, urlMilestone: string | null}) {
    const searchParams = useSearchParams()
    // const urlMilestone = searchParams.get("milestone")
    const [milestone, setMilestone] = useState<any>()

    useEffect(() => {
        if (urlMilestone) {
            getMilestoneDetails(urlMilestone).then(response => {
                if (response.success) {
                    setMilestone(response.data)
                } else {
                    console.error(response.error)
                    toast.error(response.error)
                }
            })
        }
    }, [urlMilestone])

    if (milestone) {
        return <MilestoneDetails milestone={milestone} />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Select a Milestone!
                </CardTitle>
                <CardDescription>
                    Select a milestone from the timeline or flow to see more details about it.
                </CardDescription>
            </CardHeader>
        </Card>
    )
}
