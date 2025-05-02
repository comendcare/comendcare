"use client"

import React, {ReactNode} from "react"
import {getDates} from "@/lib/utils";
import {PrivateBadge} from "./private-badge"
import {cn} from "@/lib/utils"
import {Card, CardContent} from "./ui/card"
import {Button} from "./ui/button"
import {usePathname} from "next/navigation"
import {TypeBadge} from "./type-badge"
import {TimelineCardContents} from "./private-timeline"
import {ScrollArea} from "@/components/ui/scroll-area";
import {ExternalLink} from "lucide-react"

export const PublicTimelineView = ({roadmap, subdomain, externalLinks, urlMilestone, setUrlMilestone}: {
    roadmap: any,
    subdomain: string | undefined,
    externalLinks: boolean,
    urlMilestone?: string | undefined,
    setUrlMilestone?: (id: string) => void | undefined
}) => {
    return (
        // <ScrollArea className="h-min max-h-[70vh]">
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
        // </ScrollArea>
    )
}

const TimelineElementLink = ({key, subdomain, item, urlMilestone}: {
    key: number,
    subdomain: string | undefined,
    item: any,
    urlMilestone?: string | undefined
}) => {
    return (
        <li className={cn("ml-6 text-left hover:bg-secondary p-2 rounded-md", item.private ? "pointer-events-none" : "")}>
            <a
                href={
                    subdomain ?
                        `http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/?milestone=${item?.id}&view=timeline` :
                        ''
                }
                className={cn("group", item.private ? "pointer-events-none" : "")}
                target="_blank"
            >
                <TimelineElementContent
                    item={item}
                    externalLinkIcon={true}
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
        <li className="ml-6">
            <button
                className={cn("hover:cursor-pointer text-left hover:bg-secondary p-2 rounded-md", urlMilestone === item.id ? "border-primary border-2" : "")}
                onClick={() => {
                    if (setUrlMilestone !== undefined) {
                        setUrlMilestone(item.id)
                    }
                }}
            >
                <TimelineElementContent
                    item={item}
                    externalLinkIcon={false}
                />
            </button>
        </li>
    )
}

const TimelineElementContent = ({item, externalLinkIcon}: { item: any, externalLinkIcon: boolean }) => {
    return (
        <>
            <span className="absolute flex items-center justify-center bg-white rounded-full -start-[18px]">
                <TypeBadge className="w-8 p-2" iconOnly={true} type={item?.nodeType || item?.nodeType || "PROJECT"}/>
            </span>
            <div className="flex flex-row items-center justify-start gap-4">
                <h3 className="flex flex-row justify-center items-baseline gap-2 group-hover:underline text-lg font-semibold text-gray-900 dark:text-white text-wrap">
                    {item.title}
                </h3>
                {item.private && <PrivateBadge iconOnly={true}/>}
                {!item.private && externalLinkIcon && <ExternalLink className="min-h-4 h-4 min-w-4 w-4"/>}
                <time
                    className="ml-auto block font-semibold leading-none dark:text-gray-500 text-wrap">
                    {getDates(item)}
                </time>
            </div>
            <p className="mb-2 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-2">
                {item.description}
            </p>
            <TimelineCardContents milestoneData={item} nodeType={item?.nodeType || item?.nodeType || "PROJECT"}/>
        </>
    )
}
