"use client"

import { Prisma } from "@prisma/client"
import { Option } from "@/lib/types"
import MultipleSelector from "./ui/multiple-selector"
import { useEffect, useState } from "react"
import { getMilestones } from "@/lib/fetchers"
import { useSession } from "next-auth/react"

export type Milestone = Prisma.MilestoneGetPayload<{include: {roadmap: true}}>

export default function ProjectMultipleSelector({
    value = [], 
    onChange, 
}: {
    value?: Milestone[], 
    onChange: (options: Option[]) => void, 
}) {
    const {data: session} = useSession()
    const [fetchedMilestones, setFetchedMilestones] = useState<Milestone[]>([])

    // Initialization - Allow update once form is initialized
    useEffect(() => {
        const init = async () => {
            const milestonesResponse = await getMilestones(session?.user?.organizationId || undefined, {
                id: true,
                title: true,
                roadmap: true,
                
            })
            if (milestonesResponse.success) {
                setFetchedMilestones(milestonesResponse?.data as Milestone[])
            } else {
                console.error(milestonesResponse.error)
            }
        }

        init()

    // missing dependencies disabled - we only want to run this once on initialization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <MultipleSelector
            value={value.map(milestone => ({...milestone, value: milestone.id, label: milestone.title, roadmapTitle: milestone.roadmap?.title})) as Option[]}
            onChange={onChange}
            options={fetchedMilestones.map(milestone => ({...milestone, value: milestone.id, label: milestone.title, roadmapTitle: milestone.roadmap?.title} as Option))}
            hidePlaceholderWhenSelected={true}
            showHoverCard={false}
            placeholder="Link projects"
            emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                    no results found.
                </p>
            }
            groupBy="roadmapTitle"
        />
    )
}