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
import { toast } from "sonner"
import { MilestoneDetails } from "./milestone-details"
import { getPublicMilestoneDetails } from "@/lib/fetchers"

export function PublicMilestoneDetails({roadmap, urlMilestone}: {roadmap: any, urlMilestone: string | null}) {
    const searchParams = useSearchParams()
    const [milestone, setMilestone] = useState<any>()

    useEffect(() => {
        const init = async () => {
            if (urlMilestone) {
                await getPublicMilestoneDetails(urlMilestone).then(response => {
                    if (response.success) {
                        console.log(`fetched milestone`, response.data)
                        setMilestone(response.data)
                    } else {
                        console.error(response.error)
                        toast.error(response.error)
                    }
                })
            }
        }

        init()
    }, [urlMilestone])

    if (milestone) {
        return <MilestoneDetails milestone={milestone} />
    }

    return (
        <Card className="border-2 border-black">
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
