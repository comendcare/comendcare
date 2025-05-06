"use client"

import { useEffect, useState } from "react"
import { RoadmapCard } from "./public-roadmap-card"
import { PublicMilestoneDetails } from "./public-milestone-details"
import { usePathname, useSearchParams } from "next/navigation"

export function PublicRoadmapContent({roadmap, subdomain}: {roadmap: any, subdomain: string | undefined}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [milestone, setMilestone] = useState<string | undefined>(searchParams.get("project") || undefined)
    const [view, setView] = useState<string | undefined>(searchParams.get("view") || undefined)

    console.log(`original milestone`, milestone)

    useEffect(() => {
        console.log(`milestone changed`, milestone)
        const params = new URLSearchParams(searchParams.toString())

        params.delete("view")
        params.delete("project")
        if (view) params.set("view", view)
        if (milestone) params.set("project", milestone)

        // ensure shallow url update
        const url = params.size > 0 ? `${pathname}?${params}` : `${pathname}`
        window.history.replaceState({ ...window.history.state, as: url, url: url }, '', url)
    }, [milestone, view, pathname, searchParams])
    
    return (
        <div className="flex flex-col-reverse md:grid md:grid-cols-2 m-auto w-full gap-4">
            <div className="">
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