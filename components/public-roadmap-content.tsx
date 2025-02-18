"use client"

import { useEffect, useState } from "react"
import { RoadmapCard } from "./public-roadmap-card"
import { PublicMilestoneDetails } from "./public-milestone-details"
import { useSearchParams } from "next/navigation"

export function PublicRoadmapContent({roadmap, subdomain}: {roadmap: any, subdomain: string | undefined}) {
    const searchParams = useSearchParams()
    const urlMilestone = searchParams.get("milestone")
    const [milestone, setMilestone] = useState<string | undefined>(undefined)
    const [view, setView] = useState<string | undefined>(undefined)

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        params.delete("view")
        params.delete("milestone")
        if (view) params.set("view", view)
        if (milestone) params.set("milestone", milestone)

        // router.replace(`${pathname}?${params.toString()}`)
    }, [milestone, view])
    
    return (
        <div className="flex flex-col-reverse md:grid md:grid-cols-3 m-auto w-full gap-4">
            <div className="md:col-span-2">
                <RoadmapCard
                    roadmap={roadmap}
                    subdomain={subdomain || undefined}
                    isPublic={true}
                    externalLinks={false}
                    // urlMilestone={milestone} 
                    // setUrlMilestone={setMilestone}
                    // urlView={view}
                    // setUrlView={setView}
                />
            </div>
            <div className="col-span-1">
                <PublicMilestoneDetails 
                    roadmap={roadmap}
                    urlMilestone={urlMilestone}
                />
            </div>
        </div>
    )
}