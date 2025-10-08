"use client"

import React, { memo, useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@comend/components/ui/card"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { MilestoneDetails } from "./milestone-details"
import { getPublicMilestoneDetails } from "@comend/lib/fetchers"

export function PublicMilestoneDetails({roadmap, urlMilestone}: {roadmap: any, urlMilestone: string | null}) {
    const [milestone, setMilestone] = useState<any>()

    useEffect(() => {
        const init = async () => {
            if (urlMilestone) {
                await getPublicMilestoneDetails(urlMilestone, {
                    id: true,
                    title: true,
                    nodeType: true,
                    description: true,
                    startDate: true,
                    endDate: true,
                    budget: true,
                    status: true,
                    types: true,
                    attachments: true,
                    contacts: true,
                    rfps: { include: { rfp: true } }, // optional, keeps shape consistent
                    tools: {
                        include: {
                            tool: { include: { contacts: true, attachments: true } }, // or just: tool: true
                        },
                    },
                    biosamples: {
                        include: {
                            biosample: { include: { contacts: true, attachments: true } }, // or: biosample: true
                        },
                    },
                    diseaseModels: {
                        include: {
                            diseaseModel: { include: { contacts: true, attachments: true } }, // or: diseaseModel: true
                        },
                    },
                }).then(response => {
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
        <Card className="w-full border-2 border-black">
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
