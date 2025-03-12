"use client"

import React from "react"
import {getDates} from "./pag-profile-research-plan-card"
import {PrivateBadge} from "./private-badge"
import {FaArrowUpRightFromSquare, FaDollarSign, FaUser} from "react-icons/fa6"
import { cn, formatMoney } from "@/lib/utils"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { Button } from "./ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ScrollArea } from "./ui/scroll-area"
import { TypeBadge } from "./type-badge"
import { Milestone } from "@/lib/actions"
import { Badge } from "./ui/badge"
import { AttachmentsTag } from "./private-milestone-node"
import { StatusType } from "@/lib/types"
import { DateView } from "./miletone-date-view"
import StatusButton from "./milestone-status-button"
import { MilestoneTypeBadge } from "./milestone-type-badge"

const selector = (state: RoadmapState) => ({
    selectedNodeId: state.selectedNodeId,
    setSelectedNodeId: state.setSelectedNodeId,
    milestones: state.milestones,
    nodes: state.nodes,
    setNodes: state.setNodes,
    edges: state.edges,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNodes: state.addNodes,
})

export const PrivateTimelineView = () => {
    const {
        selectedNodeId,
        setSelectedNodeId,
        milestones,
        nodes,
        setNodes: setDbNodes,
        edges,
        onEdgesChange,
        addNodes,
        onConnect,
    } = useRoadmapStore(useShallow(selector))
const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleEditClick = (nodeId: string) => {
        setSelectedNodeId(nodeId)

        // const params = new URLSearchParams(searchParams.toString())
        // params.delete("milestone")
        // params.set("milestone", nodeId)

        // router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }

    return (
        <ScrollArea className="w-full h-full p-10 pt-0">
            <ol className="ml-4 relative border-s-4 border-blue-light dark:border-gray-700 flex flex-col gap-4">
                {milestones?.sort((a, b) => {
                    return a.startDate - b.startDate
                }).map((milestone: any, index: number) => (
                    <li key={index} className="ms-6">
                        <button 
                            onClick={() => {
                                handleEditClick(milestone.nodeId)
                            }}
                            className={cn("w-full text-left hover:bg-secondary p-2 rounded-md", selectedNodeId === milestone.nodeId ? "border-primary border-2" : "")}
                        >
                            <>
                            <span className="absolute flex items-center justify-center bg-white rounded-full -start-[18px]">
                                <TypeBadge className="w-8 p-2" iconOnly={true} type={milestone?.nodeType || milestone?.node?.type || "PROJECT"}/>
                            </span>
                            <div className="flex flex-row items-center justify-start gap-4">
                                <h3 className="flex flex-row justify-center items-baseline gap-2 group-hover:underline text-lg font-semibold text-gray-900 dark:text-white ">
                                    {milestone.title}
                                </h3>
                                {milestone.private && <PrivateBadge iconOnly/>}
                                <time
                                    className="ml-auto block font-semibold leading-none dark:text-gray-500">
                                    {getDates(milestone)}
                                </time>
                            </div>
                            <p className={"mb-2 text-base font-normal text-gray-500 dark:text-gray-400 line-clamp-2"}>
                                {milestone.description}
                            </p>
                            <TimelineCardContents milestoneData={milestone} nodeType={milestone?.nodeType || milestone?.node?.type || "PROJECT"}/>
                            </>
                        </button>
                    </li>
                ))}
            </ol>
        </ScrollArea>
    )
}

export const TimelineCardContents = ({milestoneData, nodeType}: { milestoneData: Milestone, nodeType: string }) => {
    if (nodeType === "ASSET") {
        return (
            <ul className="w-full flex flex-row gap-2 text-sm items-center flex-wrap">
                {(milestoneData?.types || []).sort((a, b) => a.milestoneType?.label.length - b.milestoneType?.label.length).map((milestoneType, index) => (
                    <li key={index}>
                        <MilestoneTypeBadge label={milestoneType?.milestoneType?.label} />
                    </li>
                ))}
                {milestoneData?.attachments && milestoneData?.attachments?.length > 0 && (
                    <li>
                        <AttachmentsTag attachments={milestoneData.attachments}/>
                    </li>
                )}
                {milestoneData?.contacts && milestoneData.contacts.length > 0 && (milestoneData?.contacts || []).map((contact, index) => {
                    if (contact.name && contact.email) {
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <FaUser/>
                                <p>{contact.name} &bull; {contact.email}</p>
                            </li>)
                    } else if (contact.name) {
                        return (
                            <li key={index} className="flex gap-2 items-center w-full">
                                <FaUser/>
                                <p>{contact.name}</p>
                            </li>)
                    } else if (contact.email) {
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <FaUser/>
                                <p>{contact.email}</p>
                            </li>)
                    }
                })}
            </ul>
        )

        return
    }

    if (nodeType === "PROJECT") {
        return (
            <ul className="w-full flex flex-row gap-2 text-sm items-center flex-wrap">
                <li>
                    <StatusButton
                        className="text-sm h-7 w-min rounded-md px-2 py-1 font-medium"
                        disabled={true}
                        status={milestoneData?.status as StatusType || undefined}
                        onStatusChange={() => {
                        }}
                    />
                </li>
                {(milestoneData?.types || []).sort((a, b) => a?.milestoneType?.label.length - b?.milestoneType?.label.length).map((milestoneType, index) => (
                    <li key={index}>
                        <MilestoneTypeBadge label={milestoneType?.milestoneType?.label} />
                    </li>
                ))}
                {(milestoneData?.contacts || []).map((contact, index) => {
                    if (contact.affiliation) {
                        return (
                            <li key={index} className="flex gap-2 items-center">
                                <FaUser/>
                                <p>{contact.affiliation}</p>
                            </li>
                        )
                    }
                })}
            </ul>
        )
    }

    if (nodeType === "RFP") {
        return (
            <ul className="w-full flex flex-row gap-2 text-sm items-center flex-wrap">
                {(milestoneData?.types || []).sort((a, b) => a?.milestoneType?.label.length - b?.milestoneType?.label.length).map((milestoneType, index) => (
                    <li>
                        <MilestoneTypeBadge label={milestoneType?.milestoneType?.label} />
                    </li>
                ))}
                {milestoneData?.budget && (
                    <li className="flex gap-2 items-center">
                        <FaDollarSign/>
                        {formatMoney(milestoneData?.budget)} budget
                    </li>
                )}
            </ul>
        )
    }

    return (
        <div>error</div>
    )
}