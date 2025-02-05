"use client"

import React from "react"
import {getDates} from "./pag-profile-research-plan-card"
import {PrivateBadge} from "./private-badge"
import {FaArrowUpRightFromSquare} from "react-icons/fa6"
import { TypeBadge } from "./private-milestone-node"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./ui/card"

export const PublicTimelineView = ({roadmap, subdomain, urlMilestone}: {
    roadmap: any,
    subdomain: string | undefined,
    urlMilestone: string | undefined
}) => {

    return (
        <ol className="relative border-s border-gray-200 dark:border-gray-700 space-y-8">
            {roadmap?.milestones?.sort((a: any, b: any) => {
                    return a.startDate - b.startDate
                }).map((item: any, index: number) => (
                <a
                    href={
                        subdomain ?
                            `http://${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/research-plan/?milestone=${item?.id}&view=timeline` :
                            ''
                    }
                    key={index}
                    className={cn("group", item.private ? "pointer-events-none": "")}
                    // target="_blank"
                >
                    <li key={index} className="ms-6">
                        <span className="absolute flex items-center justify-center bg-white rounded-full -start-4">
                            <TypeBadge className="w-8 p-2" iconOnly={true} type={item?.node?.type || "PROJECT"}/>
                        </span>
                        <div className="flex flex-row items-center justify-start gap-4">
                            <h3 className="flex flex-row justify-center items-baseline gap-2 group-hover:underline text-lg font-semibold text-gray-900 dark:text-white ">
                                {item.title}
                            </h3>
                            {item.private ? (
                                <PrivateBadge/>
                            ) : (
                                <FaArrowUpRightFromSquare size={12}/>
                            )}
                            <time
                                className="ml-auto block font-semibold leading-none dark:text-gray-500">
                                {getDates(item)}
                            </time>
                        </div>
                        <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                            {item.description}
                        </p>
                        {/* {item.hasDownload && (
                        <a href="#"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-gray-100 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700">
                            <svg className="w-3.5 h-3.5 me-2.5" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                                <path
                                    d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                            </svg>
                            Download ZIP
                        </a>
                    )} */}
                    </li>
                </a>
            ))}
        </ol>
    )
}
