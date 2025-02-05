"use client"

import React from "react"
import {getDates} from "./pag-profile-research-plan-card"
import {PrivateBadge} from "./private-badge"
import {FaArrowUpRightFromSquare} from "react-icons/fa6"
import { TypeBadge } from "./private-milestone-node"
import { cn } from "@/lib/utils"
import { RoadmapState, useRoadmapStore } from "@/state/roadmap/roadmapStore"
import { useShallow } from "zustand/react/shallow"
import { Button } from "./ui/button"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

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

        const params = new URLSearchParams(searchParams.toString())
        params.delete("milestone")
        params.set("milestone", nodeId)

        // router.push(`${pathname}?${params.toString()}`, { scroll: false })
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="w-full h-full p-10">
            <ol className="relative border-s border-gray-200 dark:border-gray-700">
                {milestones?.sort((a, b) => {
                    return a.startDate - b.startDate
                }).map((milestone: any, index: number) => (
                    <li key={index} className="ms-6">
                        <button 
                            onClick={() => {
                                handleEditClick(milestone.nodeId)
                            }}
                            className={cn("w-full text-left hover:bg-secondary p-2 rounded-md", selectedNodeId === milestone.nodeId ? "bg-secondary" : "")}
                        >
                            <>
                            <span className="absolute flex items-center justify-center bg-white rounded-full -start-4">
                                <TypeBadge className="w-8 p-2" iconOnly={true} type={milestone?.node?.type || "PROJECT"}/>
                            </span>
                            <div className="flex flex-row items-center justify-start gap-4">
                                <h3 className="flex flex-row justify-center items-baseline gap-2 group-hover:underline text-lg font-semibold text-gray-900 dark:text-white ">
                                    {milestone.title}
                                </h3>
                                {milestone.private && <PrivateBadge />}
                                <time
                                    className="ml-auto block font-semibold leading-none dark:text-gray-500">
                                    {getDates(milestone)}
                                </time>
                            </div>
                            <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
                                {milestone.description}
                            </p>
                            </>
                        </button>
                    </li>
                ))}
            </ol>
        </div>
    )
}
