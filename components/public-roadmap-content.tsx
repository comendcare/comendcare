"use client"

import { useEffect, useState } from "react"
import { RoadmapCard } from "./public-roadmap-card"
import { PublicMilestoneDetails } from "./public-milestone-details"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

export function PublicRoadmapContent({roadmap, subdomain, milestoneChangedCallback}: {roadmap: any, subdomain: string | undefined, milestoneChangedCallback?: (milestoneId: string | undefined) => void}) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [milestone, setMilestone] = useState<string | undefined>(searchParams.get("project") || undefined)
    const [view, setView] = useState<string | undefined>(searchParams.get("view") || undefined)

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

        if (milestoneChangedCallback) milestoneChangedCallback(milestone)
    }, [milestone, view, pathname, searchParams])
    
    return (
        <div className="flex flex-col-reverse md:grid md:grid-cols-2 m-auto w-full gap-4">
            <div className={cn(!(roadmap.milestones && roadmap.milestones.length > 0) ? "col-span-full" : "")}>
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
            {roadmap.milestones && roadmap.milestones.length > 0 && (
                <div className="col-span-1">
                    <PublicMilestoneDetails 
                        roadmap={roadmap}
                        urlMilestone={milestone || null}
                    />
                </div>
            )}
        </div>
    )
}