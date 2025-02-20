"use client"

import { useEffect, useState } from "react"
import { RoadmapCard } from "./public-roadmap-card"
import { PublicMilestoneDetails } from "./public-milestone-details"
import { usePathname, useSearchParams } from "next/navigation"

export function PublicRoadmapContent({roadmap, subdomain}: {roadmap: any, subdomain: string | undefined}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [milestone, setMilestone] = useState<string | undefined>(searchParams.get("milestone") || undefined)
    const [view, setView] = useState<string | undefined>(searchParams.get("view") || undefined)

    console.log(`original milestone`, milestone)

    useEffect(() => {
        console.log(`milestone changed`, milestone)
        const params = new URLSearchParams(searchParams.toString())

        params.delete("view")
        params.delete("milestone")
        if (view) params.set("view", view)
        if (milestone) params.set("milestone", milestone)

        // ensure shallow url update
        const url = params.size > 0 ? `${pathname}?${params}` : `${pathname}`
        window.history.replaceState({ ...window.history.state, as: url, url: url }, '', url)
    }, [milestone, view])
    
    return (
        <div className="flex flex-col-reverse md:grid md:grid-cols-3 m-auto w-full gap-4">
            <div className="md:col-span-2">
                <RoadmapCard
                    roadmap={roadmap}
                    subdomain={subdomain || undefined}
                    isPublic={true}
                    externalLinks={false}
                    urlMilestone={milestone} 
                    setUrlMilestone={setMilestone}
                    urlView={view}
                    setUrlView={setView}
                />
            </div>
            <div className="col-span-1">
                <PublicMilestoneDetails 
                    roadmap={roadmap}
                    urlMilestone={milestone || null}
                />
            </div>
        </div>
    )
}