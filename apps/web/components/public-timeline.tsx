"use client"

import React, {useEffect, useRef, useState} from "react"
import {cn} from "@comend/lib/utils"
import {DraggableTimelineItem, TimelineItemContent} from "./private-timeline"
import {ScrollArea} from "@comend/components/ui/scroll-area";
import { mixpanelTrack } from "@comend/lib/mixpanel";

export const PublicTimelineView = ({roadmap, subdomain, externalLinks, urlMilestone, setUrlMilestone}: {
    roadmap: any,
    subdomain: string | undefined,
    externalLinks: boolean,
    urlMilestone?: string | undefined,
    setUrlMilestone?: (id: string) => void | undefined
}) => {
    const contentRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState<number>()

    useEffect(() => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight
        const maxHeight = window.innerHeight * 0.7
        setHeight(Math.min(contentHeight, maxHeight))
      }
    }, [])

    return (
        <ScrollArea style={{ height }} className="pr-4">
            <div ref={contentRef}>
            <ol className="ml-4 relative border-s-4 border-blue-light dark:border-gray-700 flex flex-col gap-4">
                {roadmap?.milestones?.sort((a: any, b: any) => {
                    // sort by custom order
                    return a.timelineOrder - b.timelineOrder

                    // sort by start date
                    // if (!!a.startDate && !!b.startDate) return a.startDate.getTime() - b.startDate.getTime()
                                
                    // // Keep relative order of items without a startDate
                    // if (!a.startDate && !b.startDate) return 0
            
                    // // Move items without startDate to the end
                    // return !!a.startDate ? -1 : 1

                    // sort by end date
                    // if (!!a.endDate && !!b.endDate) return a.endDate.getTime() - b.endDate.getTime()
                                
                    // // Keep relative order of items without a startDate
                    // if (!a.endDate && !b.endDate) return 0
            
                    // // Move items without startDate to the end
                    // return !!a.endDate ? -1 : 1
                }).map((item: any, index: number) => (
                    externalLinks
                        ?
                        <TimelineElementLink key={index} subdomain={subdomain} item={item} urlMilestone={urlMilestone}/>
                        : <TimelineElementButton key={index} item={item} setUrlMilestone={setUrlMilestone}
                                                    urlMilestone={urlMilestone}/>
                ))}
            </ol>
            </div>
        </ScrollArea>
    )
}

const TimelineElementLink = ({key, subdomain, item, urlMilestone}: {
    key: number,
    subdomain: string | undefined,
    item: any,
    urlMilestone?: string | undefined
}) => {
    return (
        <li className={cn("ml-6 text-left w-full p-2 rounded-md", item.private ? "pointer-events-none" : "")}>
            <a
                href={
                    subdomain ?
                        `http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/?milestone=${item?.id}&view=timeline` :
                        ''
                }
                onClick={() => {
                    mixpanelTrack("Project Details Viewed", {
                        "ID": item?.id,
                        "Title": item?.title,
                        "Types": (item?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id),
                        "Status": item?.status,
                        "Budget": item?.budget
                    })
                }}
                className={cn("group", item.private ? "pointer-events-none" : "")}
                target="_blank"
            >
                {/* <TimelineElementContent
                    item={item}
                    externalLinkIcon={true}
                /> */}
                <DraggableTimelineItem
                    milestone={item}
                    index={key}
                    selectedNodeIds={[]}
                    disabled={true}
                    isPrivate={false}
                    isDraggable={false}
                />
            </a>
        </li>
    )
}

const TimelineElementButton = ({key, item, setUrlMilestone, urlMilestone}: {
    key: number,
    item: any,
    setUrlMilestone?: (id: string) => void | undefined,
    urlMilestone?: string | undefined
}) => {
    return (
        <li className="flex items-start -ml-[10px] gap-2">
            <span className="flex items-center justify-center rounded-full mt-6">
                {/* <TypeBadge iconOnly={true} type={milestone?.nodeType || milestone?.nodeType || "PROJECT"}/> */}
                <div className="bg-blue-light h-4 w-4 rounded-full"/>
            </span>

            <button
                className={cn("hover:cursor-pointer text-left w-full p-2 rounded-md", urlMilestone === item.id ? "border-primary border-2" : "border-gray-200 border-2")}
                onClick={() => {
                    mixpanelTrack("Project Details Viewed", {
                        "ID": item?.id,
                        "Title": item?.title,
                        "Types": (item?.types || []).map((type: any) => type.milestoneType.label || type.milestoneType.id),
                        "Status": item?.status,
                        "Budget": item?.budget
                    })
                    
                    if (setUrlMilestone !== undefined) {
                        setUrlMilestone(item.id)
                    }
                }}
            >
                {/* <TimelineElementContent
                    item={item}
                    externalLinkIcon={false}
                /> */}
                <TimelineItemContent milestone={item} isDraggable={false} isPrivate={false} />
            </button>
        </li>
    )
}
