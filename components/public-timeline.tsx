"use client"

import React, { ReactNode } from "react"
import {getDates} from "./pag-profile-research-plan-card"
import {PrivateBadge} from "./private-badge"
import {FaArrowUpRightFromSquare} from "react-icons/fa6"
import { TypeBadge } from "./private-milestone-node"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { usePathname } from "next/navigation"

export const PublicTimelineView = ({roadmap, subdomain, externalLinks}: {
    roadmap: any,
    subdomain: string | undefined,
    externalLinks: boolean
}) => {
    return (
        <ol className="relative border-s border-gray-200 dark:border-gray-700 space-y-8">
            {roadmap?.milestones?.sort((a: any, b: any) => {
                    return a.startDate - b.startDate
                }).map((item: any, index: number) => (
                    externalLinks 
                        ? <TimelineElementLink key={index} subdomain={subdomain} item={item}/> 
                        : <TimelineElementButton key={index} item={item} />
            ))}
        </ol>
    )
}

const TimelineElementLink = ({key, subdomain, item}: {key: number, subdomain: string | undefined, item: any}) => {
    return (
        <a
            href={
                subdomain ?
                    `http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/?milestone=${item?.id}&view=timeline` :
                    ''
            }
            className={cn("group", item.private ? "pointer-events-none": "")}
            target="_blank"
        >
            <TimelineElementContent 
                item={item}
                externalLinkIcon={true}
            />
        </a>
    )
}

const TimelineElementButton = ({key, item}: {key: number, item: any}) => {
    return (
        <Button asChild>
            <TimelineElementContent 
                item={item}
                externalLinkIcon={false}
            />
        </Button>
    )
}

const TimelineElementContent = ({item, externalLinkIcon}: {item: any, externalLinkIcon: boolean}) => {
    return (
        <li className="ms-6">
            <span className="absolute flex items-center justify-center bg-white rounded-full -start-4">
                <TypeBadge className="w-8 p-2" iconOnly={true} type={item?.node?.type || "PROJECT"}/>
            </span>
            <div className="flex flex-row items-center justify-start gap-4">
                <h3 className="flex flex-row justify-center items-baseline gap-2 group-hover:underline text-lg font-semibold text-gray-900 dark:text-white ">
                    {item.title}
                </h3>
                {item.private && <PrivateBadge iconOnly={true}/>}
                {!item.private && externalLinkIcon && <FaArrowUpRightFromSquare size={12}/>}
                <time
                    className="ml-auto block font-semibold leading-none dark:text-gray-500">
                    {getDates(item)}
                </time>
            </div>
            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-2">
                {item.description}
            </p>
        </li>
    )
}